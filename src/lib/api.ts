import type { Gift, Wish } from '../types'
import { assertAllowed, recordAction, toApiError } from './rateLimit'
import { supabase } from './supabase'

export const PAGE_SIZE = 20

const WISH_COLS = 'id, text, wisher_name, created_at, gifts(count)'

interface WishRow {
  id: string
  text: string
  wisher_name: string | null
  created_at: string
  gifts: { count: number }[] | null
}

const toWish = (r: WishRow): Wish => ({
  id: r.id,
  text: r.text,
  wisher_name: r.wisher_name,
  created_at: r.created_at,
  gift_count: r.gifts?.[0]?.count ?? 0,
})

export async function listWishes(before?: string): Promise<Wish[]> {
  let q = supabase.from('wishes').select(WISH_COLS).order('created_at', { ascending: false }).limit(PAGE_SIZE)
  if (before) q = q.lt('created_at', before)
  const { data, error } = await q
  if (error) throw toApiError(error)
  return (data as unknown as WishRow[]).map(toWish)
}

export async function listWishesByIds(ids: string[]): Promise<Wish[]> {
  if (ids.length === 0) return []
  const { data, error } = await supabase
    .from('wishes')
    .select(WISH_COLS)
    .in('id', ids)
    .order('created_at', { ascending: false })
  if (error) throw toApiError(error)
  return (data as unknown as WishRow[]).map(toWish)
}

export async function getWish(id: string): Promise<Wish | null> {
  const { data, error } = await supabase.from('wishes').select(WISH_COLS).eq('id', id).maybeSingle()
  if (error) throw toApiError(error)
  return data ? toWish(data as unknown as WishRow) : null
}

export async function createWish(text: string, wisherName: string): Promise<Wish> {
  assertAllowed('wish')
  const { data, error } = await supabase
    .from('wishes')
    .insert({ text: text.trim(), wisher_name: wisherName.trim() || null })
    .select('id, text, wisher_name, created_at')
    .single()
  if (error) throw toApiError(error)
  recordAction('wish')
  return { ...(data as Omit<Wish, 'gift_count'>), gift_count: 0 }
}

export async function listGifts(wishId: string): Promise<Gift[]> {
  const { data, error } = await supabase
    .from('gifts')
    .select('*')
    .eq('wish_id', wishId)
    .order('created_at', { ascending: false })
  if (error) throw toApiError(error)
  return data as Gift[]
}

export async function getGift(id: string): Promise<Gift | null> {
  const { data, error } = await supabase.from('gifts').select('*').eq('id', id).maybeSingle()
  if (error) throw toApiError(error)
  return data as Gift | null
}

export async function grantGift(input: {
  wishId: string
  giftType: string
  alias: string
  message: string
}): Promise<Gift> {
  assertAllowed('gift')
  const { data, error } = await supabase
    .from('gifts')
    .insert({
      wish_id: input.wishId,
      gift_type: input.giftType,
      sender_alias: input.alias,
      message: input.message.trim() || null,
    })
    .select('*')
    .single()
  if (error) throw toApiError(error)
  recordAction('gift')
  return data as Gift
}
