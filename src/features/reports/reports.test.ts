import { beforeEach, describe, expect, it } from 'vitest'
import { getReportedIds, hasReported, markReported, REASONS } from './reports'

beforeEach(() => {
  const store = new Map<string, string>()
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) },
  })
})

describe('reports', () => {
  it('offers exactly the reasons the database accepts', () => {
    // keep in step with the CHECK constraint in migration 0004
    expect(REASONS.map((r) => r.value).sort()).toEqual(['offensive', 'other', 'personal-info', 'spam'])
  })

  it('remembers which wishes this browser reported', () => {
    expect(hasReported('a')).toBe(false)
    markReported('a')
    markReported('b')
    expect(hasReported('a')).toBe(true)
    expect(getReportedIds().size).toBe(2)
  })

  it('does not crash on corrupted storage', () => {
    localStorage.setItem('wishing-well:reported', '{oops')
    expect(hasReported('a')).toBe(false)
  })
})
