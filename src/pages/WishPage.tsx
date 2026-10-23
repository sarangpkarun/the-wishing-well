import confetti from 'canvas-confetti'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { DeniedControls } from '../features/denied'
import { ReportButton } from '../features/reports'
import { ShareButton } from '../features/share'
import { PigeonProfileLink } from '../features/pigeons'
import { GiftTimeline } from '../components/gift/GiftTimeline'
import { GrantGiftModal } from '../components/gift/GrantGiftModal'
import { Skeleton } from '../components/ui/Skeleton'
import { DEFAULT_WISHER, timeAgo } from '../lib/format'
import { getOpenedGiftIds, isMyWish } from '../lib/myWishes'
import { useWish } from '../hooks/useWish'
import type { Gift } from '../types'

export function WishPage() {
  const { id } = useParams()
  const { wish, gifts, loading, error, addGift } = useWish(id)
  const [open, setOpen] = useState(false)
  const [sentAs, setSentAs] = useState<string | null>(null)

  if (loading) return <Skeleton className="h-40" />
  if (error) return <p className="card text-red-300" role="alert">{error}</p>
  if (!wish) {
    return (
      <div className="card text-center">
        <p>This wish evaporated.</p>
        <Link to="/wall" className="btn-gold mt-3">Back to the Wall</Link>
      </div>
    )
  }

  const mine = isMyWish(wish.id)
  const opened = getOpenedGiftIds()
  // Oldest unopened first: gifts arrive newest-first, so reverse.
  const unopened = gifts.filter((g) => !opened.has(g.id)).reverse()

  function granted(g: Gift) {
    addGift(g)
    setSentAs(g.sender_alias)
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.8 } })
  }

  return (
    <div className="space-y-5">
      <Link to="/wall" className="text-sm text-gold-200/60 hover:text-gold-200">← Back to the Wall</Link>
      <div className="card">
        <p className="text-2xl font-semibold">“{wish.text}”</p>
        <p className="mt-2 text-sm text-gold-200/60">
          — {wish.wisher_name || DEFAULT_WISHER} · {timeAgo(wish.created_at)}
        </p>
      </div>

      <DeniedControls wishId={wish.id} />

      {mine && unopened.length > 0 && (
        <Link
          to={`/wish/${wish.id}/reveal/${unopened[0].id}`}
          className="btn-gold w-full flex-col !rounded-3xl py-5 text-center shadow-[0_0_40px_rgba(245,197,66,0.5)]"
        >
          <span className="font-title text-xl font-black">🎉 Your wish has been granted!</span>
          <span className="text-sm font-normal">
            {unopened.length} unopened {unopened.length === 1 ? 'gift' : 'gifts'}. Tap to open.
          </span>
        </Link>
      )}

      {mine ? (
        <div className="card space-y-2 text-center">
          <p className="text-gold-200/70">This is your wish. Share the link and wait for strangers to be generous.</p>
          <button className="btn-ghost" onClick={() => navigator.clipboard?.writeText(window.location.href)}>
            Copy link 🔗
          </button>
        </div>
      ) : (
        <button className="btn-gold w-full text-lg" onClick={() => setOpen(true)}>
          Grant this wish 🎁
        </button>
      )}

      {sentAs && (
        <p className="card text-center text-gold-300" role="status">
          Sent as <b>{sentAs}</b>. The wisher has been notified (not really).
        </p>
      )}

      {gifts.length > 0 && <ShareButton gift={gifts[0]} wishText={wish.text} mine={mine} className="btn-gold w-full" />}

      <PigeonProfileLink wishId={wish.id} wisherName={wish.wisher_name} />

      <h2 className="text-xl font-bold">Gifts ({gifts.length})</h2>
      <GiftTimeline gifts={gifts} />

      <div className="text-center">
        <ReportButton wishId={wish.id} />
      </div>

      <GrantGiftModal wish={wish} open={open} onClose={() => setOpen(false)} onGranted={granted} />
    </div>
  )
}
