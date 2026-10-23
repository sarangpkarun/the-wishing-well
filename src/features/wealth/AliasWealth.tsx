import { useEffect, useState } from 'react'
import { fetchAliasGifts } from './api'
import { WealthMeter } from './WealthMeter'

/** Fetches an alias's gift count and shows its meter. Drop it anywhere an alias is shown. */
export function AliasWealth({ alias, hideAlias = true }: { alias: string; hideAlias?: boolean }) {
  const [gifts, setGifts] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchAliasGifts(alias)
      .then((n) => !cancelled && setGifts(n))
      .catch(() => !cancelled && setGifts(null)) // the meter is garnish: fail quietly
    return () => {
      cancelled = true
    }
  }, [alias])

  if (gifts === null) return null
  return (
    <div className="rounded-xl border border-gold-500/30 bg-well-900/60 p-3">
      <div className="mb-1 text-[10px] uppercase tracking-[0.25em] text-gold-400">Your net worth just went up</div>
      <WealthMeter alias={alias} gifts={gifts} hideAlias={hideAlias} />
    </div>
  )
}
