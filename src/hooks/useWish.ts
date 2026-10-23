import { useCallback, useEffect, useState } from 'react'
import { getWish, listGifts } from '../lib/api'
import { supabase } from '../lib/supabase'
import type { Gift, Wish } from '../types'

interface Loaded {
  id: string
  wish: Wish | null
  gifts: Gift[]
  error: string | null
}

const withGift = (gifts: Gift[], g: Gift) => (gifts.some((x) => x.id === g.id) ? gifts : [g, ...gifts])

export function useWish(id: string | undefined) {
  // Results are keyed by id, so "loading" is derived (no id match yet) instead of being set in an effect.
  const [loaded, setLoaded] = useState<Loaded | null>(null)

  const addGift = useCallback(
    (g: Gift) => setLoaded((cur) => (cur && cur.id === id ? { ...cur, gifts: withGift(cur.gifts, g) } : cur)),
    [id],
  )

  useEffect(() => {
    if (!id) return
    let cancelled = false
    Promise.all([getWish(id), listGifts(id)])
      .then(([wish, gifts]) => !cancelled && setLoaded({ id, wish, gifts, error: null }))
      .catch((e: Error) => !cancelled && setLoaded({ id, wish: null, gifts: [], error: e.message }))

    const channel = supabase
      .channel(`wish-${id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'gifts', filter: `wish_id=eq.${id}` },
        (p) => addGift(p.new as Gift),
      )
      .subscribe()

    return () => {
      cancelled = true
      void supabase.removeChannel(channel)
    }
  }, [id, addGift])

  const current = loaded && loaded.id === id ? loaded : null
  return {
    wish: current?.wish ?? null,
    gifts: current?.gifts ?? [],
    loading: Boolean(id) && current === null,
    error: current?.error ?? null,
    addGift,
  }
}
