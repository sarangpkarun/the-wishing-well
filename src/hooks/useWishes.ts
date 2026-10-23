import { useCallback, useEffect, useRef, useState } from 'react'
import { listWishes, PAGE_SIZE } from '../lib/api'
import { supabase } from '../lib/supabase'
import type { Wish } from '../types'

type WishInsert = Omit<Wish, 'gift_count'>

const byNewest = (a: Wish, b: Wish) => b.created_at.localeCompare(a.created_at)

/** Wall feed: first page, "load more", and realtime wishes + gift counts. */
export function useWishes() {
  const [wishes, setWishes] = useState<Wish[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [live, setLive] = useState(false)
  const loadingMore = useRef(false)

  useEffect(() => {
    let cancelled = false
    const add = (w: Wish) =>
      setWishes((cur) => (cur.some((x) => x.id === w.id) ? cur : [w, ...cur].sort(byNewest)))

    const channel = supabase
      .channel('wall')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'wishes' }, (p) =>
        add({ ...(p.new as WishInsert), gift_count: 0 }),
      )
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'gifts' }, (p) => {
        const wishId = (p.new as { wish_id: string }).wish_id
        setWishes((cur) => cur.map((w) => (w.id === wishId ? { ...w, gift_count: w.gift_count + 1 } : w)))
      })
      .subscribe((status) => !cancelled && setLive(status === 'SUBSCRIBED'))

    listWishes()
      .then((rows) => {
        if (cancelled) return
        // Merge: a realtime insert may have landed while the first page was loading.
        setWishes((cur) => [...cur.filter((c) => !rows.some((r) => r.id === c.id)), ...rows].sort(byNewest))
        setHasMore(rows.length === PAGE_SIZE)
      })
      .catch((e: Error) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false))

    return () => {
      cancelled = true
      void supabase.removeChannel(channel)
    }
  }, [])

  const loadMore = useCallback(async () => {
    if (loadingMore.current || wishes.length === 0) return
    loadingMore.current = true
    try {
      const rows = await listWishes(wishes[wishes.length - 1].created_at)
      setWishes((cur) => [...cur, ...rows.filter((r) => !cur.some((c) => c.id === r.id))])
      setHasMore(rows.length === PAGE_SIZE)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      loadingMore.current = false
    }
  }, [wishes])

  /** Show my own wish immediately instead of waiting for the realtime echo. */
  const prepend = useCallback(
    (w: Wish) => setWishes((cur) => (cur.some((x) => x.id === w.id) ? cur : [w, ...cur].sort(byNewest))),
    [],
  )

  return { wishes, loading, error, hasMore, live, loadMore, prepend }
}
