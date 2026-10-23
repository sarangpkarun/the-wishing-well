import { describe, expect, it } from 'vitest'
import {
  assertAllowed,
  describeWait,
  evaluate,
  LIMITS,
  limitMessage,
  RateLimitError,
  recordAction,
  toApiError,
} from './rateLimit'

const MIN = 60 * 1000
const HOUR = 60 * MIN

function memoryStore() {
  const m = new Map<string, string>()
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) }
}

describe('evaluate', () => {
  it('allows up to max, blocks the next', () => {
    const now = 10 * HOUR
    const stamps = (n: number) => Array.from({ length: n }, (_, i) => now - i * MIN)
    expect(evaluate(stamps(4), 5, HOUR, now).ok).toBe(true)
    expect(evaluate(stamps(5), 5, HOUR, now).ok).toBe(false)
  })

  it('ignores actions older than the window', () => {
    const now = 10 * HOUR
    expect(evaluate(Array(5).fill(now - HOUR - 1), 5, HOUR, now).ok).toBe(true)
  })

  it('says when the oldest action expires', () => {
    const now = 10 * HOUR
    const v = evaluate([now - 50 * MIN, now - 40 * MIN, now - 30 * MIN, now - 20 * MIN, now - 10 * MIN], 5, HOUR, now)
    expect(v.ok).toBe(false)
    expect(v.retryAfterMs).toBe(10 * MIN) // the 50-minute-old one leaves the window in 10 minutes
  })
})

describe('assertAllowed / recordAction', () => {
  it('lets 5 wishes through per hour and blocks the 6th with a friendly message', () => {
    const store = memoryStore()
    const t0 = 1_000_000_000
    for (let i = 0; i < LIMITS.wish.max; i++) {
      expect(() => assertAllowed('wish', t0 + i * MIN, store)).not.toThrow()
      recordAction('wish', t0 + i * MIN, store)
    }
    const at = t0 + 6 * MIN
    expect(() => assertAllowed('wish', at, store)).toThrow(RateLimitError)
    try {
      assertAllowed('wish', at, store)
    } catch (e) {
      expect((e as RateLimitError).message).toMatch(/5 wishes per hour/)
      expect((e as RateLimitError).retryAfterMs).toBe(54 * MIN)
    }
    // ...and the allowance returns once the first wish ages out
    expect(() => assertAllowed('wish', t0 + HOUR + MIN, store)).not.toThrow()
  })

  it('tracks each action separately', () => {
    const store = memoryStore()
    for (let i = 0; i < 5; i++) recordAction('wish', 1000 + i, store)
    expect(() => assertAllowed('wish', 2000, store)).toThrow()
    expect(() => assertAllowed('gift', 2000, store)).not.toThrow()
  })

  it('never blocks when storage is unavailable (the server still enforces)', () => {
    expect(() => assertAllowed('wish', 0, null)).not.toThrow()
    expect(() => recordAction('wish', 0, null)).not.toThrow()
  })

  it('survives corrupted storage', () => {
    const store = memoryStore()
    store.setItem('wishing-well:rl:wish', '{not json')
    expect(() => assertAllowed('wish', 0, store)).not.toThrow()
  })
})

describe('messages and server errors', () => {
  it('describes waits', () => {
    expect(describeWait(1000)).toBe('about a minute')
    expect(describeWait(12 * MIN)).toBe('12 minutes')
    expect(limitMessage('gift', 5 * MIN)).toContain('30 gifts per hour')
  })

  it('maps the database rate-limit error', () => {
    const e = toApiError({ message: 'Rate limit: you have hit the hourly limit for this. Try again later.', hint: 'rate_limit' })
    expect(e).toBeInstanceOf(RateLimitError)
    expect(e.message).toMatch(/^The well is tired: /)
  })

  it('passes other errors through untouched', () => {
    const e = toApiError({ message: 'permission denied for table wishes' })
    expect(e).not.toBeInstanceOf(RateLimitError)
    expect(e.message).toBe('permission denied for table wishes')
  })
})
