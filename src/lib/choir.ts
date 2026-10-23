// "Angelic choir", synthesised with the Web Audio API so there is no audio file to
// license, host or download. Sawtooth voices run through vowel ("ah") formant filters,
// with slow attack, vibrato and a long reverb tail. Must be started from a user gesture.

interface Playing {
  master: GainNode
  endsAt: number
}

let ctx: AudioContext | null = null
let reverb: ConvolverNode | null = null
let playing: Playing | null = null

// C major 9 spread over three octaves, with a high shimmer on top.
const VOICES = [130.81, 196.0, 261.63, 329.63, 392.0, 493.88, 587.33, 659.25, 1046.5]
const FORMANTS: { f: number; q: number; gain: number }[] = [
  { f: 800, q: 8, gain: 1 },
  { f: 1150, q: 10, gain: 0.5 },
  { f: 2900, q: 12, gain: 0.2 },
]
const ATTACK = 1.4
const HOLD = 2.6
const RELEASE = 3.2

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  ctx ??= new AC()
  return ctx
}

/** Noise with an exponential decay is a cheap, convincing cathedral. */
function impulse(c: AudioContext, seconds = 4, decay = 2.2): AudioBuffer {
  const length = Math.floor(c.sampleRate * seconds)
  const buf = c.createBuffer(2, length, c.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch)
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay)
  }
  return buf
}

export function isChoirSupported(): boolean {
  return getContext() !== null
}

export function playChoir(): void {
  const c = getContext()
  if (!c) return
  void c.resume()
  const now = c.currentTime
  if (playing && playing.endsAt > now + 1) return // already singing

  reverb ??= (() => {
    const r = c.createConvolver()
    r.buffer = impulse(c)
    return r
  })()

  const master = c.createGain()
  master.gain.value = 2.2
  const compressor = c.createDynamicsCompressor()
  const wet = c.createGain()
  wet.gain.value = 0.75
  master.connect(compressor)
  master.connect(reverb)
  reverb.connect(wet).connect(compressor)
  compressor.connect(c.destination)

  const end = now + ATTACK + HOLD + RELEASE
  VOICES.forEach((freq, i) => {
    const high = freq > 1000
    const voice = c.createGain()
    const peak = high ? 0.02 : 0.05
    // Stagger entries so the chord blooms instead of landing at once.
    const start = now + i * 0.12
    voice.gain.setValueAtTime(0, start)
    voice.gain.linearRampToValueAtTime(peak, start + ATTACK)
    voice.gain.setValueAtTime(peak, start + ATTACK + HOLD)
    voice.gain.linearRampToValueAtTime(0, end)
    voice.connect(master)

    const vibrato = c.createOscillator()
    vibrato.frequency.value = 4.8 + (i % 3) * 0.4
    const vibratoDepth = c.createGain()
    vibratoDepth.gain.value = 9 // cents
    vibrato.connect(vibratoDepth)

    const source = c.createGain()
    for (const f of FORMANTS) {
      const band = c.createBiquadFilter()
      band.type = 'bandpass'
      band.frequency.value = high ? f.f * 1.6 : f.f
      band.Q.value = f.q
      const g = c.createGain()
      g.gain.value = f.gain
      source.connect(band).connect(g).connect(voice)
    }

    for (const detune of high ? [0] : [-7, 7]) {
      const osc = c.createOscillator()
      osc.type = high ? 'sine' : 'sawtooth'
      osc.frequency.value = freq
      osc.detune.value = detune
      vibratoDepth.connect(osc.detune)
      osc.connect(high ? voice : source)
      osc.start(start)
      osc.stop(end + 0.1)
    }
    vibrato.start(start)
    vibrato.stop(end + 0.1)
  })

  playing = { master, endsAt: end }
  window.setTimeout(() => {
    if (playing?.master === master) playing = null
    master.disconnect()
  }, (end - now + 5) * 1000) // let the reverb tail ring out first
}

/** Fade out quickly (used when the user mutes mid-song). */
export function stopChoir(): void {
  if (!ctx || !playing) return
  const { master } = playing
  master.gain.cancelScheduledValues(ctx.currentTime)
  master.gain.setValueAtTime(master.gain.value, ctx.currentTime)
  master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4)
  playing = null
}
