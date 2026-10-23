import { motion } from 'framer-motion'
import { GIFT_CATALOG, type CatalogGift, type Rarity } from '../../config/giftCatalog'

const RARITY: Record<Rarity, string> = {
  common: 'border-white/10',
  rare: 'border-sky-300/50',
  legendary: 'border-gold-400/80 shadow-[0_0_18px_rgba(255,210,63,0.3)]',
}

interface Props {
  selected: string | null
  onSelect: (gift: CatalogGift) => void
}

export function GiftCatalogGrid({ selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Gift catalog">
      {GIFT_CATALOG.map((g) => (
        <motion.button
          key={g.id}
          type="button"
          role="radio"
          aria-checked={selected === g.id}
          whileHover={{ rotate: [0, -2, 2, 0], scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => onSelect(g)}
          className={`rounded-2xl border-2 bg-gold-400/5 p-3 text-left ${RARITY[g.rarity]} ${
            selected === g.id ? 'bg-gold-400/20 ring-2 ring-gold-400' : ''
          }`}
        >
          <div className="text-4xl">{g.emoji}</div>
          <div className="mt-1 text-sm font-semibold leading-tight">{g.name}</div>
          <div className="mt-0.5 text-[11px] leading-tight text-gold-200/60">{g.description}</div>
          <div className="mt-1 text-[11px] font-semibold leading-tight text-gold-400">{g.price}</div>
          {g.rarity !== 'common' && (
            <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-gold-300">{g.rarity}</div>
          )}
        </motion.button>
      ))}
    </div>
  )
}
