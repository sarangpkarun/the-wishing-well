import { motion } from 'framer-motion'
import { getGift } from '../../config/giftCatalog'
import type { Gift } from '../../types'
import { timeAgo } from '../../lib/format'

export function GiftTimeline({ gifts }: { gifts: Gift[] }) {
  if (gifts.length === 0) {
    return <p className="card text-center text-gold-200/60">No gifts yet. The well is lonely. 🕸️</p>
  }
  return (
    <ul className="space-y-2">
      {gifts.map((g) => {
        const item = getGift(g.gift_type)
        return (
          <motion.li key={g.id} layout initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="card flex gap-3">
            <div className="text-3xl">{item.emoji}</div>
            <div className="min-w-0 flex-1">
              <p className="text-sm">
                <b className="text-gold-300">{g.sender_alias}</b> sent <b>{item.name}</b>
              </p>
              {g.message && <p className="mt-0.5 break-words text-sm italic text-gold-200/70">“{g.message}”</p>}
              <p className="mt-0.5 text-xs text-gold-200/40">{timeAgo(g.created_at)}</p>
            </div>
          </motion.li>
        )
      })}
    </ul>
  )
}
