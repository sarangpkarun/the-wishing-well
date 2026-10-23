import { motion } from 'framer-motion'
import { getGift } from '../../config/giftCatalog'
import type { Gift } from '../../types'

interface Props {
  gift: Gift
  wishText: string | null
  /** The wisher sees "Your wish"; anyone else sees a neutral headline. */
  mine: boolean
}

export function GrantedCard({ gift, wishText, mine }: Props) {
  const item = getGift(gift.gift_type)
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.85, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 160, damping: 16 }}
      className="relative overflow-hidden rounded-3xl border-2 border-gold-400 bg-gradient-to-b from-well-700 to-well-900 px-5 py-8 text-center shadow-[0_0_70px_rgba(245,197,66,0.4)]"
      aria-labelledby="granted-heading"
    >
      {/* Slowly rotating god-rays. Decorative; hidden for reduced motion via the global rule. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 -z-0 h-[140%] w-[140%] -translate-x-1/2 -translate-y-1/2 opacity-25"
        style={{
          background:
            'repeating-conic-gradient(from 0deg, rgba(255,227,138,0.9) 0deg 6deg, transparent 6deg 24deg)',
          maskImage: 'radial-gradient(circle, black 0%, transparent 62%)',
          WebkitMaskImage: 'radial-gradient(circle, black 0%, transparent 62%)',
        }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 90, ease: 'linear' }}
      />

      <div className="relative z-10">
        <p className="text-[0.65rem] uppercase tracking-[0.4em] text-gold-400">✦ Official Notice ✦</p>
        <h1 id="granted-heading" className="gold-text mt-3 font-title text-3xl font-black leading-tight sm:text-5xl">
          {mine ? 'Your wish has been granted!' : 'This wish has been granted!'}
        </h1>
        {wishText && <p className="mx-auto mt-3 max-w-md break-words text-lg italic text-gold-200/80">“{wishText}”</p>}

        <motion.div
          initial={{ scale: 0, rotate: -40 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 180, damping: 11, delay: 0.35 }}
          className="my-5 text-[7.5rem] leading-none drop-shadow-[0_0_30px_rgba(255,227,138,0.6)]"
        >
          {item.emoji}
        </motion.div>

        <h2 className="text-2xl font-bold text-gold-300">{item.name}</h2>
        <p className="mt-1 text-gold-200/70">{item.revealLine}</p>

        <p className="mt-5 text-sm text-gold-200/70">
          Granted by <b className="text-gold-300">{gift.sender_alias}</b>
        </p>
        {gift.message && (
          <p className="mx-auto mt-2 max-w-sm break-words rounded-xl border border-gold-500/30 bg-gold-400/5 px-3 py-2 text-sm italic">
            “{gift.message}”
          </p>
        )}
      </div>
    </motion.section>
  )
}
