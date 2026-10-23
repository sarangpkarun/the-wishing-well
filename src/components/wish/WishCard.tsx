import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { DeniedStamp, isDenied } from '../../features/denied'
import { DEFAULT_WISHER, timeAgo } from '../../lib/format'
import type { Wish } from '../../types'

/** A wish as a gold coin-topped card. The coin shows how many gifts it has received. */
export function WishCard({ wish, index = 0 }: { wish: Wish; index?: number }) {
  const gifts = wish.gift_count
  return (
    <motion.li
      layout
      className="min-w-0"
      initial={{ opacity: 0, y: -20, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24, delay: Math.min(index, 8) * 0.04 }}
    >
      <Link
        to={`/wish/${wish.id}`}
        className="card group relative flex h-full gap-4 overflow-hidden transition hover:-translate-y-0.5 hover:border-gold-300/70 hover:shadow-[0_0_28px_rgba(245,197,66,0.25)]"
      >
        <div
          className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full bg-gold-foil text-well-900 shadow-[0_0_16px_rgba(245,197,66,0.45)] ring-2 ring-gold-200/60 transition group-hover:rotate-12"
          aria-label={`${gifts} ${gifts === 1 ? 'gift' : 'gifts'}`}
        >
          <span className="text-lg font-black leading-none">{gifts}</span>
          <span className="text-[9px] font-bold uppercase tracking-wide">{gifts === 1 ? 'gift' : 'gifts'}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="break-words text-lg font-semibold leading-snug">“{wish.text}”</p>
          <p className="mt-2 text-xs text-gold-200/60">
            — <span className="text-gold-300">{wish.wisher_name || DEFAULT_WISHER}</span> · {timeAgo(wish.created_at)}
          </p>
        </div>
        {isDenied(wish.id) && (
          <div className="absolute bottom-2 right-2">
            <DeniedStamp />
          </div>
        )}
      </Link>
    </motion.li>
  )
}

export function WishCardSkeleton() {
  return (
    <li className="card flex animate-pulse gap-4" aria-hidden>
      <div className="h-14 w-14 shrink-0 rounded-full bg-gold-400/20" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-4 w-11/12 rounded bg-gold-400/15" />
        <div className="h-4 w-2/3 rounded bg-gold-400/15" />
        <div className="h-3 w-1/3 rounded bg-gold-400/10" />
      </div>
    </li>
  )
}
