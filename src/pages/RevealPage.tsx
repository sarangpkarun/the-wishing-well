import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ConfettiReveal } from '../components/reveal/ConfettiReveal'
import { Skeleton } from '../components/ui/Skeleton'
import { getGift, getWish, listGifts } from '../lib/api'
import { getOpenedGiftIds, isMyWish, markGiftOpened } from '../lib/myWishes'
import type { Gift, Wish } from '../types'

interface Loaded {
  gift: Gift
  wish: Wish | null
  siblings: Gift[]
}

export function RevealPage() {
  const { id, giftId } = useParams()
  const [data, setData] = useState<Loaded | null | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)
  const [seen, setSeen] = useState(getOpenedGiftIds)

  useEffect(() => {
    if (!id || !giftId) return
    let cancelled = false
    Promise.all([getGift(giftId), getWish(id), listGifts(id)])
      .then(([gift, wish, siblings]) => {
        if (!cancelled) setData(gift && gift.wish_id === id ? { gift, wish, siblings } : null)
      })
      .catch((e: Error) => !cancelled && setError(e.message))
    return () => {
      cancelled = true
      setData(undefined)
    }
  }, [id, giftId])

  if (error) return <p className="card text-red-300" role="alert">{error}</p>
  if (data === undefined) return <Skeleton className="h-64" />
  if (data === null) {
    return (
      <div className="card text-center">
        <p>That gift got lost in the mail (there is no mail).</p>
        <Link to="/wall" className="btn-gold mt-3">Back to the Wall</Link>
      </div>
    )
  }

  const { gift, wish, siblings } = data
  const mine = isMyWish(gift.wish_id)
  // Oldest unopened first, so a wisher works through their gifts in the order they arrived.
  const unopened = siblings.filter((g) => g.id !== gift.id && !seen.has(g.id)).reverse()
  const next = mine && unopened.length > 0 ? { href: `/wish/${gift.wish_id}/reveal/${unopened[0].id}`, remaining: unopened.length } : null

  return (
    <div>
      <ConfettiReveal
        key={gift.id}
        gift={gift}
        wishText={wish?.text ?? null}
        mine={mine}
        next={next}
        onOpened={() => {
          markGiftOpened(gift.id)
          setSeen(getOpenedGiftIds())
        }}
      />
      <div className="mt-10 flex justify-center gap-3">
        <Link to={`/wish/${gift.wish_id}`} className="btn-ghost">Back to wish</Link>
        <Link to="/mine" className="btn-ghost">My wishes</Link>
      </div>
    </div>
  )
}
