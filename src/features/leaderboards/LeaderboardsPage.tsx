import { useEffect, useState } from 'react'
import { DEFAULT_WISHER } from '../../lib/format'
import {
  fetchBroke,
  fetchGenerous,
  fetchUnrealistic,
  type BrokeRow,
  type GenerousRow,
  type UnrealisticRow,
} from './api'
import { Board, type BoardRow } from './Board'

/** Loads one board independently so a failure in one doesn't blank the others. */
function useBoard<T, R extends BoardRow>(load: () => Promise<T[]>, map: (row: T) => R) {
  const [state, setState] = useState<{ rows: R[] | null; error: string | null }>({ rows: null, error: null })
  useEffect(() => {
    let cancelled = false
    load()
      .then((rows) => !cancelled && setState({ rows: rows.map(map), error: null }))
      .catch((e: Error) => !cancelled && setState({ rows: null, error: e.message }))
    return () => {
      cancelled = true
    }
    // load/map are module-level functions, stable for the page's lifetime
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return state
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

const generousRow = (r: GenerousRow): BoardRow => ({
  key: r.sender_alias,
  title: r.sender_alias,
  subtitle: `Spread across ${plural(r.wishes_granted, 'wish', 'wishes')}. Zero rupees spent.`,
  score: r.gifts,
  scoreLabel: r.gifts === 1 ? 'gift' : 'gifts',
})

const brokeRow = (r: BrokeRow): BoardRow => ({
  key: r.wisher_name,
  title: r.wisher_name,
  subtitle: `${r.ungranted} of ${plural(r.wishes, 'wish', 'wishes')} ungranted. ${r.gifts === 0 ? 'The well has forgotten them.' : 'Received a little pity.'}`,
  score: r.ungranted,
  scoreLabel: 'ungranted',
})

const unrealisticRow = (r: UnrealisticRow): BoardRow => ({
  key: r.id,
  title: `“${r.text}”`,
  subtitle: `— ${r.wisher_name || DEFAULT_WISHER}. Strangers kept throwing nonsense at it.`,
  score: r.gifts,
  scoreLabel: r.gifts === 1 ? 'gift' : 'gifts',
  href: `/wish/${r.id}`,
})

export function LeaderboardsPage() {
  const generous = useBoard(fetchGenerous, generousRow)
  const broke = useBoard(fetchBroke, brokeRow)
  const unrealistic = useBoard(fetchUnrealistic, unrealisticRow)

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h1 className="gold-text font-title text-3xl font-black">Leaderboards</h1>
        <p className="mt-2 text-sm text-gold-200/70">Rankings of questionable importance. Updated whenever you refresh.</p>
      </div>

      <Board
        title="Most Generous Fake Billionaire"
        blurb="Most gifts sent. Your alias sticks to your browser, so keep sending to climb."
        {...generous}
        emptyText="No gifts yet. The rich are hoarding."
      />
      <Board
        title="Most Broke Wisher"
        blurb="Most wishes that nobody granted. Named wishers only; Anonymous Dreamers keep their dignity."
        {...broke}
        emptyText="Every named wisher has been granted something. Suspicious."
      />
      <Board
        title="Most Unrealistic Wish"
        blurb="The wishes that collected the most gifts, because apparently that's what unrealistic means."
        {...unrealistic}
        emptyText="No wish has received a gift yet. All wishes are realistic. For now."
      />
    </div>
  )
}
