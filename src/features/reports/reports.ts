// Feature: report a wish. Reports are stored in public.reports (migration 0004) and reviewed by
// an admin in the Supabase dashboard; the API can insert them but never read them back.

export const REASONS = [
  { value: 'personal-info', label: 'Contains personal info', hint: 'Phone number, email, address, full name' },
  { value: 'offensive', label: 'Offensive or hateful', hint: 'Slurs, harassment, nastiness' },
  { value: 'spam', label: 'Spam or ads', hint: 'Links, promotions, nonsense that is not the fun kind' },
  { value: 'other', label: 'Something else', hint: 'Tell us in the box below' },
] as const

export type ReportReason = (typeof REASONS)[number]['value']
export const MAX_DETAILS = 200

const KEY = 'wishing-well:reported'

export function getReportedIds(): Set<string> {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return new Set(Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string') : [])
  } catch {
    return new Set()
  }
}

export const hasReported = (wishId: string): boolean => getReportedIds().has(wishId)

/** Remembered locally so the same browser can't pile on reports for one wish. */
export function markReported(wishId: string): void {
  try {
    localStorage.setItem(KEY, JSON.stringify([...getReportedIds().add(wishId)].slice(-500)))
  } catch {
    /* storage unavailable: the server-side rate limit still applies */
  }
}
