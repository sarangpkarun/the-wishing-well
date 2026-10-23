import { assertAllowed, recordAction, toApiError } from '../../lib/rateLimit'
import { supabase } from '../../lib/supabase'
import { markReported, type ReportReason } from './reports'

/** Files a report. Insert-only: RLS gives the API no way to read reports back. */
export async function reportWish(wishId: string, reason: ReportReason, details: string): Promise<void> {
  assertAllowed('report')
  const { error } = await supabase
    .from('reports')
    .insert({ wish_id: wishId, reason, details: details.trim() || null })
  if (error) throw toApiError(error)
  recordAction('report')
  markReported(wishId)
}
