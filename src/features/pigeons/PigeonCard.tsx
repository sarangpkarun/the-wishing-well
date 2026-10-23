import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { getGift } from '../../config/giftCatalog'
import { timeAgo } from '../../lib/format'
import type { PigeonGift } from './api'
import { lostness, pigeonStatus } from './pigeons'

export function PigeonCard({ pigeon, index }: { pigeon: PigeonGift; index: number }) {
  const item = getGift(pigeon.gift_type)
  const lost = lostness(pigeon.id)
  return (
    <motion.li
      initial={{ opacity: 0, y: 16, rotate: -1 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.05 }}
      className="card min-w-0 space-y-2"
    >
      <div className="flex items-start gap-3">
        <div className="text-5xl leading-none" aria-hidden>
          {item.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold leading-tight">{item.name}</h3>
          <p className="text-xs text-gold-200/60">
            Sent by <span className="text-gold-300">{pigeon.sender_alias}</span> · {timeAgo(pigeon.created_at)}
          </p>
        </div>
      </div>

      <p className="text-sm italic text-gold-200/80">Status: {pigeonStatus(pigeon.id)}</p>

      <div>
        <div className="mb-1 flex justify-between text-[10px] uppercase tracking-widest text-gold-200/50">
          <span>Lost-o-meter</span>
          <span>{lost}%</span>
        </div>
        <div
          role="meter"
          aria-label="How lost this pigeon is"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={lost}
          className="h-2 overflow-hidden rounded-full bg-well-900"
        >
          <div className="h-full rounded-full bg-gold-foil" style={{ width: `${lost}%` }} />
        </div>
      </div>

      {pigeon.message && <p className="break-words text-sm text-gold-200/70">“{pigeon.message}”</p>}
      <Link to={`/wish/${pigeon.wishes.id}`} className="block truncate text-xs text-gold-400 hover:underline">
        For: “{pigeon.wishes.text}”
      </Link>
    </motion.li>
  )
}
