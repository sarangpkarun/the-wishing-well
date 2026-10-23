import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Skeleton } from '../components/ui/Skeleton'
import { WishCard } from '../components/wish/WishCard'
import { listWishesByIds } from '../lib/api'
import { getMyWishIds } from '../lib/myWishes'
import type { Wish } from '../types'

export function MyWishesPage() {
  const [wishes, setWishes] = useState<Wish[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listWishesByIds(getMyWishIds())
      .then(setWishes)
      .catch((e: Error) => setError(e.message))
  }, [])

  if (error) return <p className="card text-red-300" role="alert">{error}</p>
  if (!wishes) return <Skeleton className="h-32" />

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">My wishes</h1>
      <p className="text-sm text-gold-200/60">
        No accounts here. Wishes are remembered by this browser. Clear your site data and the genie forgets you.
      </p>
      {wishes.length === 0 ? (
        <div className="card text-center">
          <p className="text-gold-200/70">You haven't wished for anything. Suspiciously content.</p>
          <Link to="/wall" className="btn-gold mt-3">Make a wish</Link>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {wishes.map((w, i) => (
            <WishCard key={w.id} wish={w} index={i} />
          ))}
        </ul>
      )}
    </div>
  )
}
