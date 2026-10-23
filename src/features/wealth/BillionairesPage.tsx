import { useEffect, useState } from 'react'
import { Skeleton } from '../../components/ui/Skeleton'
import { getSavedAlias } from '../../lib/aliasStore'
import { fetchAliasGifts, fetchRichList, type AliasStat } from './api'
import { WealthMeter } from './WealthMeter'

export function BillionairesPage() {
  const [list, setList] = useState<AliasStat[] | null>(null)
  const [mine, setMine] = useState<{ alias: string; gifts: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchRichList()
      .then((l) => !cancelled && setList(l))
      .catch((e: Error) => !cancelled && setError(e.message))
    const alias = getSavedAlias()
    if (alias) {
      fetchAliasGifts(alias)
        .then((gifts) => !cancelled && setMine({ alias, gifts }))
        .catch(() => undefined)
    }
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h1 className="gold-text font-title text-3xl font-black">The Rich List</h1>
        <p className="mt-2 text-sm text-gold-200/70">
          Net worth of every fake billionaire. It goes up with every gift sent. The maths does not check out.
        </p>
      </div>

      {mine && (
        <section className="card" aria-label="Your net worth">
          <div className="mb-2 text-[10px] uppercase tracking-[0.25em] text-gold-400">You</div>
          <WealthMeter alias={mine.alias} gifts={mine.gifts} />
        </section>
      )}

      {error && (
        <p className="card text-red-300" role="alert">
          {error}
        </p>
      )}
      {!error && list === null && (
        <div className="space-y-3" aria-hidden>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      )}
      {list?.length === 0 && <p className="card text-center text-gold-200/60">Nobody has sent a gift. Everyone is broke. Equality!</p>}

      <ol className="space-y-3">
        {list?.map((a, i) => (
          <li key={a.sender_alias} className="card flex gap-3">
            <span className="w-7 shrink-0 pt-0.5 text-center text-lg font-black text-gold-400">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <WealthMeter alias={a.sender_alias} gifts={a.gifts} />
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
