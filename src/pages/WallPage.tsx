import { motion } from 'framer-motion'
import { useState } from 'react'
import { GenieButton } from '../features/genie'
import { MakeWishModal } from '../components/wish/MakeWishModal'
import { WishCard, WishCardSkeleton } from '../components/wish/WishCard'
import { useWishes } from '../hooks/useWishes'

export function WallPage() {
  const { wishes, loading, error, hasMore, live, loadMore, prepend } = useWishes()
  const [open, setOpen] = useState(false)
  const [tossed, setTossed] = useState(false)

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h1 className="gold-text font-title text-3xl font-black">The Wall of Wishes</h1>
        <p className="mt-2 text-sm text-gold-200/70">Strangers with fake fortunes will grant them with questionable gifts.</p>
        <button className="btn-gold mt-4 w-full px-8 py-3 text-lg sm:w-auto" onClick={() => setOpen(true)}>
          Make a wish ✨
        </button>
        <div className="mt-2">
          <GenieButton wishes={wishes} />
        </div>
      </div>

      {tossed && (
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card text-center text-gold-300"
          role="status"
        >
          Coin tossed! Your wish is on the wall. Now wait for a stranger with a fake fortune.
        </motion.p>
      )}

      <div className="flex items-center justify-between text-xs text-gold-200/60">
        <span>{loading ? 'Peering into the well…' : `${wishes.length}${hasMore ? '+' : ''} wishes`}</span>
        <span className={live ? 'text-emerald-300' : ''} title={live ? 'New wishes appear automatically' : 'Connecting…'}>
          {live ? '● Live' : '○ Connecting'}
        </span>
      </div>

      {error && (
        <p className="card text-red-300" role="alert">
          The well sprang a leak: {error}
        </p>
      )}

      {loading && (
        <ul className="grid gap-3 sm:grid-cols-2" aria-label="Loading wishes">
          {Array.from({ length: 6 }, (_, i) => (
            <WishCardSkeleton key={i} />
          ))}
        </ul>
      )}

      {!loading && !error && wishes.length === 0 && (
        <div className="card space-y-3 py-10 text-center">
          <div className="text-6xl">🕳️</div>
          <p className="text-xl font-semibold">The well is empty.</p>
          <p className="text-gold-200/70">
            Not a single wish. Even the echo left. Statistically, someone out there wants a pizza. Be that someone.
          </p>
          <button className="btn-gold" onClick={() => setOpen(true)}>
            Make the first wish
          </button>
        </div>
      )}

      {wishes.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {wishes.map((w, i) => (
            <WishCard key={w.id} wish={w} index={i} />
          ))}
        </ul>
      )}

      {hasMore && (
        <button className="btn-ghost w-full" onClick={loadMore}>
          Dig deeper into the well
        </button>
      )}

      <MakeWishModal
        open={open}
        onClose={() => setOpen(false)}
        onCreated={(w) => {
          prepend(w)
          setOpen(false)
          setTossed(true)
          setTimeout(() => setTossed(false), 6000)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
      />
    </div>
  )
}
