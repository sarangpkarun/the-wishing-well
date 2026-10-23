import { supabase } from '../../lib/supabase'

export const BOARD_SIZE = 10

export interface GenerousRow {
  sender_alias: string
  gifts: number
  wishes_granted: number
}
export interface BrokeRow {
  wisher_name: string
  wishes: number
  ungranted: number
  gifts: number
}
export interface UnrealisticRow {
  id: string
  text: string
  wisher_name: string | null
  gifts: number
}

async function rows<T>(q: PromiseLike<{ data: unknown; error: { message: string } | null }>): Promise<T[]> {
  const { data, error } = await q
  if (error) throw new Error(error.message)
  return data as T[]
}

/** Aliases with the most gifts sent. */
export const fetchGenerous = () =>
  rows<GenerousRow>(
    supabase
      .from('alias_stats')
      .select('sender_alias, gifts, wishes_granted')
      .order('gifts', { ascending: false })
      .order('last_gift_at', { ascending: false })
      .limit(BOARD_SIZE),
  )

/** Named wishers with the most wishes that nobody has granted. Fewest gifts breaks ties. */
export const fetchBroke = () =>
  rows<BrokeRow>(
    supabase
      .from('wisher_stats')
      .select('wisher_name, wishes, ungranted, gifts')
      .gt('ungranted', 0)
      .order('ungranted', { ascending: false })
      .order('gifts', { ascending: true })
      .order('wishes', { ascending: false })
      .limit(BOARD_SIZE),
  )

/** Wishes that attracted the biggest pile of nonsense. */
export const fetchUnrealistic = () =>
  rows<UnrealisticRow>(
    supabase
      .from('wish_stats')
      .select('id, text, wisher_name, gifts')
      .gt('gifts', 0)
      .order('gifts', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(BOARD_SIZE),
  )
