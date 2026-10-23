import confetti from 'canvas-confetti'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { toBlob } from 'html-to-image'
import { ShareButton } from '../../features/share'
import { useSoundPref } from '../../hooks/useSoundPref'
import { isChoirSupported, playChoir, stopChoir } from '../../lib/choir'
import { receiptForGift } from '../../lib/receipt'
import type { Gift } from '../../types'
import { Receipt } from '../receipt/Receipt'
import { GrantedCard } from './GrantedCard'
import { SoundToggle } from './SoundToggle'

const COLORS = ['#ffd23f', '#ffe38a', '#f4b400', '#ff6b9d', '#6bd6ff', '#ffffff']

function burst() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  confetti({ particleCount: 140, spread: 90, origin: { y: 0.55 }, colors: COLORS })
  setTimeout(() => confetti({ particleCount: 90, angle: 60, spread: 70, origin: { x: 0, y: 0.7 }, colors: COLORS }), 250)
  setTimeout(() => confetti({ particleCount: 90, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, colors: COLORS }), 400)
  setTimeout(() => confetti({ particleCount: 60, spread: 120, startVelocity: 20, gravity: 0.6, origin: { y: 0.2 }, colors: COLORS }), 900)
}

interface Props {
  gift: Gift
  wishText: string | null
  /** Wisher gets the closed-box suspense; anyone else lands straight on the card. */
  mine: boolean
  /** Called once when the box is opened (to remember it was seen). */
  onOpened?: () => void
  next?: { href: string; remaining: number } | null
}

/** Closed box -> tap -> confetti + choir -> "granted" card -> receipt. */
export function ConfettiReveal({ gift, wishText, mine, onOpened, next }: Props) {
  const [opened, setOpened] = useState(!mine)
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<string | null>(null)
  const { enabled: sound, set: setSound } = useSoundPref()
  const frameRef = useRef<HTMLDivElement>(null)
  const soundSupported = isChoirSupported()

  // Visitors who land straight on the card (not the wisher) get confetti, but never surprise audio.
  useEffect(() => {
    if (!mine) burst()
  }, [mine])

  function celebrate() {
    burst()
    if (sound) playChoir()
  }

  function open() {
    setOpened(true)
    celebrate()
    onOpened?.()
  }

  function toggleSound(on: boolean) {
    setSound(on)
    if (on) playChoir() // this click is the user gesture browsers require
    else stopChoir()
  }

  async function capture(): Promise<Blob> {
    const node = frameRef.current
    if (!node) throw new Error('Receipt not ready')
    const opts = { pixelRatio: 2, cacheBust: true, backgroundColor: '#070504' }
    try {
      const blob = await toBlob(node, opts)
      if (blob) return blob
    } catch {
      /* web-font inlining can fail offline or behind blockers; retry with system fonts */
    }
    const blob = await toBlob(node, { ...opts, skipFonts: true })
    if (!blob) throw new Error('Could not render the receipt')
    return blob
  }

  async function run(action: (blob: Blob, name: string) => Promise<void>) {
    setBusy(true)
    setNote(null)
    try {
      await action(await capture(), `wishing-well-${receiptForGift(gift).txnId}.png`)
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setNote('Could not make the image. Try a screenshot instead!')
    } finally {
      setBusy(false)
    }
  }

  const save = () =>
    run(async (blob, name) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = name
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 5000)
    })

  return (
    <div>
      {soundSupported && (
        <div className="mb-4 flex justify-end">
          <SoundToggle enabled={sound} onChange={toggleSound} />
        </div>
      )}

      <AnimatePresence mode="wait">
        {!opened ? (
          <motion.div key="box" className="py-8 text-center" exit={{ scale: 1.5, opacity: 0 }} transition={{ duration: 0.35 }}>
            <p className="mb-6 text-lg">
              Something has arrived from <b className="text-gold-300">{gift.sender_alias}</b>!
            </p>
            <motion.button
              onClick={open}
              aria-label="Open your gift"
              className="text-[9rem] leading-none drop-shadow-[0_0_30px_rgba(245,197,66,0.5)]"
              animate={{ rotate: [0, -6, 6, -6, 6, 0], y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, repeatDelay: 0.6 }}
              whileTap={{ scale: 0.9 }}
            >
              🎁
            </motion.button>
            <p className="mt-6 text-sm text-gold-200/60">Tap to open</p>
          </motion.div>
        ) : (
          <motion.div key="open" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <GrantedCard gift={gift} wishText={wishText} mine={mine} />

            <div className="space-y-4">
              <h2 className="text-center text-sm uppercase tracking-[0.3em] text-gold-400">Your receipt</h2>
              <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
                <Receipt ref={frameRef} gift={gift} />
              </motion.div>

              <div className="flex flex-wrap justify-center gap-3">
                <button className="btn-gold" onClick={save} disabled={busy}>
                  {busy ? 'Printing…' : 'Save receipt 📸'}
                </button>
                <ShareButton gift={gift} wishText={wishText} mine={mine} className="btn-ghost" />
                <button className="btn-ghost" onClick={celebrate}>
                  Again! 🎉
                </button>
              </div>
              {note && (
                <p className="text-center text-sm text-red-300" role="alert">
                  {note}
                </p>
              )}
              {next && (
                <div className="text-center">
                  <Link to={next.href} className="btn-gold">
                    Open next gift ({next.remaining} more) 🎁
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
