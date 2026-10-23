// A random per-browser id, sent as the `x-session-id` header so the database can rate-limit per
// session. It's not an account and carries no identity: clearing site data gives you a new one.
const KEY = 'wishing-well:session'

let cached: string | null = null

export function getSessionId(): string {
  if (cached) return cached
  try {
    const stored = localStorage.getItem(KEY)
    if (stored && /^[0-9a-f-]{8,64}$/i.test(stored)) return (cached = stored)
  } catch {
    /* storage unavailable: fall through to an in-memory id for this tab */
  }
  const id = crypto.randomUUID()
  try {
    localStorage.setItem(KEY, id)
  } catch {
    /* ignore */
  }
  return (cached = id)
}
