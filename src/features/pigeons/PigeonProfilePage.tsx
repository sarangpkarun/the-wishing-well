import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Skeleton } from '../../components/ui/Skeleton'
import { fetchPigeonsForWish, fetchPigeonsForWisher, type PigeonGift } from './api'
import { PigeonCard } from './PigeonCard'
import { pigeonStats } from './pigeons'

/** Serves both /pigeons/wisher/:name and /pigeons/wish/:wishId. */
export function PigeonProfilePage() {
  const { name, wishId } = useParams()
  const [pigeons, setPigeons] = useState<PigeonGift[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = name ? fetchPigeonsForWisher(name) : wishId ? fetchPigeonsForWish(wishId) : Promise.resolve([])
    load
      .then((p) => !cancelled && setPigeons(p))
      .catch((e: Error) => !cancelled && setError(e.message))
    return () => {
      cancelled = true
      setPigeons(null)
      setError(null)
    }
  }, [name, wishId])

  const stats = pigeonStats(pigeons ?? [])
  const title = name ? `${name}'s Pigeon Loft` : 'Pigeons for this wish'

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="text-6xl">🐦</div>
        <h1 className="gold-text mt-2 break-words font-title text-3xl font-black">{title}</h1>
        <p className="mt-2 text-sm text-gold-200/70">Every pigeon ever sent. None have arrived.</p>
      </div>

      {error && (
        <p className="card text-red-300" role="alert">
          {error}
        </p>
      )}
      {!error && pigeons === null && (
        <div className="space-y-3" aria-hidden>
          <Skeleton className="h-16" />
          <Skeleton className="h-40" />
        </div>
      )}

      {pigeons && (
        <>
          <dl className="grid grid-cols-3 gap-2 text-center">
            {[
              ['Pigeons', String(stats.total)],
              ['Breeds', String(stats.breeds)],
              ['Avg. lost', `${stats.avgLost}%`],
            ].map(([label, value]) => (
              <div key={label} className="card !p-3">
                <dd className="text-2xl font-black text-gold-300">{value}</dd>
                <dt className="text-[10px] uppercase tracking-widest text-gold-200/60">{label}</dt>
              </div>
            ))}
          </dl>

          {pigeons.length === 0 ? (
            <div className="card space-y-2 py-8 text-center">
              <p className="text-lg font-semibold">The loft is empty.</p>
              <p className="text-gold-200/70">No pigeons yet. Kevin is out there somewhere. Lost.</p>
              <Link to="/wall" className="btn-gold mt-2">
                Back to the Wall
              </Link>
            </div>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {pigeons.map((p, i) => (
                <PigeonCard key={p.id} pigeon={p} index={i} />
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
