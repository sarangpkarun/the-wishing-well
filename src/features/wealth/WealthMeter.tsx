import { motion } from 'framer-motion'
import { netWorth } from './wealth'

interface Props {
  alias: string
  gifts: number
  /** Hide the alias heading (when the surrounding UI already shows it). */
  hideAlias?: boolean
}

/** Net worth gauge. Fills up with every gift; the numbers are, by design, nonsense. */
export function WealthMeter({ alias, gifts, hideAlias }: Props) {
  const w = netWorth(alias, gifts)
  const pct = Math.round(w.fill * 100)
  return (
    <div className="space-y-1.5 text-left">
      {!hideAlias && <div className="break-words font-semibold leading-tight">{alias}</div>}

      <div
        role="meter"
        aria-label={`Net worth of ${alias}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-valuetext={w.amount}
        className="relative h-3.5 overflow-hidden rounded-full border border-gold-500/40 bg-well-900"
      >
        <motion.div
          className="h-full rounded-full bg-gold-foil bg-[length:200%_100%] animate-shimmer"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 60, damping: 14 }}
        />
      </div>
      <div className="flex justify-between text-[9px] uppercase tracking-widest text-gold-200/40" aria-hidden>
        <span>Broke</span>
        <span>Emotionally wealthy</span>
        <span>∞</span>
      </div>

      <div className="text-sm font-bold text-gold-300">{w.amount}</div>
      <div className="text-xs text-gold-200/70">
        {w.tier} <span className="text-gold-200/40">· {w.sideNote}</span>
      </div>
    </div>
  )
}
