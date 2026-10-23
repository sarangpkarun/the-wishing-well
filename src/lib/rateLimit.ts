// Client-side rate limiting: friendly, instant feedback before a request is even sent.
// It is NOT the security boundary (anyone can clear localStorage or skip the site); the database
// enforces the same limits in supabase/migrations/0004_reports_and_rate_limits.sql.

const HOUR = 60 * 60 * 1000

/** Keep these in step with the trigger arguments in migration 0004 (per-session limits). */
export const LIMITS = {
  wish: { max: 5, windowMs: HOUR, noun: 'wishes' },
  gift: { max: 30, windowMs: HOUR, noun: 'gifts' },
  report: { max: 20, windowMs: HOUR, noun: 'reports' },
} as const

export type LimitedAction = keyof typeof LIMITS

export class RateLimitError extends Error {
  readonly retryAfterMs: number
  constructor(message: string, retryAfterMs = 0) {
    super(message)
    this.name = 'RateLimitError'
    this.retryAfterMs = retryAfterMs
  }
}

export interface Verdict {
  ok: boolean
  /** When blocked: how long until the oldest action in the window expires. */
  retryAfterMs: number
}

/** Pure core: given past action timestamps, may another happen at `now`? */
export function evaluate(timestamps: readonly number[], max: number, windowMs: number, now: number): Verdict {
  const recent = timestamps.filter((t) => now - t < windowMs).sort((a, b) => a - b)
  if (recent.length < max) return { ok: true, retryAfterMs: 0 }
  // Blocked until enough old ones fall out of the window to get back under `max`.
  const freesUp = recent[recent.length - max] + windowMs
  return { ok: false, retryAfterMs: Math.max(0, freesUp - now) }
}

export function describeWait(ms: number): string {
  const minutes = Math.max(1, Math.ceil(ms / 60000))
  return minutes === 1 ? 'about a minute' : `${minutes} minutes`
}

export function limitMessage(action: LimitedAction, retryAfterMs: number): string {
  const { max, noun } = LIMITS[action]
  return `The well is tired: ${max} ${noun} per hour is the limit. Try again in ${describeWait(retryAfterMs)}.`
}

type Store = Pick<Storage, 'getItem' | 'setItem'>

const storageKey = (action: LimitedAction) => `wishing-well:rl:${action}`

function defaultStore(): Store | null {
  try {
    return localStorage
  } catch {
    return null
  }
}

function read(store: Store | null, action: LimitedAction): number[] {
  if (!store) return []
  try {
    const raw = JSON.parse(store.getItem(storageKey(action)) ?? '[]')
    return Array.isArray(raw) ? raw.filter((t): t is number => typeof t === 'number') : []
  } catch {
    return []
  }
}

/** Throws RateLimitError if this browser has used up its hourly allowance for `action`. */
export function assertAllowed(action: LimitedAction, now = Date.now(), store: Store | null = defaultStore()): void {
  const { max, windowMs } = LIMITS[action]
  const v = evaluate(read(store, action), max, windowMs, now)
  if (!v.ok) throw new RateLimitError(limitMessage(action, v.retryAfterMs), v.retryAfterMs)
}

/** Call after a successful action. Storage failures are ignored (the server still enforces). */
export function recordAction(action: LimitedAction, now = Date.now(), store: Store | null = defaultStore()): void {
  if (!store) return
  const { windowMs } = LIMITS[action]
  const kept = read(store, action).filter((t) => now - t < windowMs)
  try {
    store.setItem(storageKey(action), JSON.stringify([...kept, now]))
  } catch {
    /* ignore */
  }
}

/** Turn a Postgrest error from the rate-limit trigger into a RateLimitError; pass others through. */
export function toApiError(error: { message: string; hint?: string | null }): Error {
  if (error.hint === 'rate_limit' || /^rate limit:/i.test(error.message)) {
    return new RateLimitError(error.message.replace(/^rate limit:\s*/i, 'The well is tired: '))
  }
  return new Error(error.message)
}
