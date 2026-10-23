import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Modal } from '../../components/ui/Modal'
import type { Wish } from '../../types'
import { GENIE_ALIAS, GENIE_COOLDOWN_MS } from './genie'
import { summonGenie, type GenieResult } from './summon'

interface Props {
  /** Wishes the Genie may pick from (e.g. the ones loaded on the wall). */
  wishes: Wish[]
}

export function GenieButton({ wishes }: Props) {
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<GenieResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [cooldownUntil, setCooldownUntil] = useState(0)
  const [now, setNow] = useState(() => Date.now())

  // Tick only while a cooldown is running.
  useEffect(() => {
    if (cooldownUntil <= Date.now()) return
    const t = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(t)
  }, [cooldownUntil])

  const waitSeconds = Math.max(0, Math.ceil((cooldownUntil - now) / 1000))

  async function summon() {
    if (busy || waitSeconds > 0) return
    setBusy(true)
    setError(null)
    setResult(null)
    try {
      // Let the lamp wiggle for a moment so it feels like something is happening.
      const [res] = await Promise.all([summonGenie(wishes), new Promise((r) => setTimeout(r, 900))])
      if (res) setResult(res)
      else setError('The Genie looked everywhere. No wishes he is allowed to grant. (He skips yours.)')
      setOpen(true)
      setNow(Date.now())
      setCooldownUntil(Date.now() + GENIE_COOLDOWN_MS)
    } catch (e) {
      setError((e as Error).message)
      setOpen(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button className="btn-ghost w-full sm:w-auto" onClick={summon} disabled={busy || waitSeconds > 0 || wishes.length === 0}>
        <motion.span
          aria-hidden
          animate={busy ? { rotate: [0, -20, 20, -20, 20, 0], scale: [1, 1.2, 1] } : { rotate: 0 }}
          transition={{ duration: 0.9 }}
        >
          🧞
        </motion.span>
        {busy ? 'Rubbing lamp…' : waitSeconds > 0 ? `Genie resting (${waitSeconds}s)` : 'Random Genie'}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={result ? 'The Genie has spoken 🧞' : 'The Genie is confused'}>
        {result ? (
          <div className="space-y-4 text-center">
            <div className="text-7xl">{result.item.emoji}</div>
            <p>
              <b className="text-gold-300">{GENIE_ALIAS}</b> granted
              <span className="block italic text-gold-200/80">“{result.wish.text}”</span>
              with <b>{result.item.name}</b>.
            </p>
            <p className="text-sm text-gold-200/60">{result.gift.message}</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Link to={`/wish/${result.wish.id}`} className="btn-gold">
                See the wish
              </Link>
              <button className="btn-ghost" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
          </div>
        ) : (
          <p className="text-red-300" role="alert">
            {error}
          </p>
        )}
      </Modal>
    </>
  )
}
