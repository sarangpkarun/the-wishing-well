import { supabase } from '../../lib/supabase'
import { PIGEON_IDS } from './pigeons'

export interface PigeonGift {
  id: string
  gift_type: string
  sender_alias: string
  message: string | null
  created_at: string
  wishes: { id: string; text: string; wisher_name: string | null }
}

const COLS = 'id, gift_type, sender_alias, message, created_at, wishes!inner(id, text, wisher_name)'

async function run(q: PromiseLike<{ data: unknown; error: { message: string } | null }>): Promise<PigeonGift[]> {
  const { data, error } = await q
  if (error) throw new Error(error.message)
  return data as PigeonGift[]
}

/** Every pigeon sent to any wish made under this name. */
export const fetchPigeonsForWisher = (name: string) =>
  run(
    supabase
      .from('gifts')
      .select(COLS)
      .in('gift_type', PIGEON_IDS)
      .eq('wishes.wisher_name', name)
      .order('created_at', { ascending: false }),
  )

/** Pigeons for a single wish (used when the wisher is anonymous and has no name to group by). */
export const fetchPigeonsForWish = (wishId: string) =>
  run(
    supabase
      .from('gifts')
      .select(COLS)
      .in('gift_type', PIGEON_IDS)
      .eq('wish_id', wishId)
      .order('created_at', { ascending: false }),
  )
