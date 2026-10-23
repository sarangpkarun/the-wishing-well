import { supabase } from '../../lib/supabase'

export interface AliasStat {
  sender_alias: string
  gifts: number
  wishes_granted: number
}

/** How many gifts an alias has sent (0 if it has never sent one). */
export async function fetchAliasGifts(alias: string): Promise<number> {
  const { data, error } = await supabase.from('alias_stats').select('gifts').eq('sender_alias', alias).maybeSingle()
  if (error) throw new Error(error.message)
  return (data as { gifts: number } | null)?.gifts ?? 0
}

export async function fetchRichList(limit = 20): Promise<AliasStat[]> {
  const { data, error } = await supabase
    .from('alias_stats')
    .select('sender_alias, gifts, wishes_granted')
    .order('gifts', { ascending: false })
    .order('last_gift_at', { ascending: false })
    .limit(limit)
  if (error) throw new Error(error.message)
  return data as AliasStat[]
}
