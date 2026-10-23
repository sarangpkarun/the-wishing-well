import { beforeEach, describe, expect, it } from 'vitest'
import { isDenied, isLocallyDenied, isRandomlyDenied, setLocallyDenied } from './denied'

// Minimal localStorage for the node test environment.
beforeEach(() => {
  const store = new Map<string, string>()
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) },
  })
})

describe('wish denied', () => {
  it('denies about 10% of wishes', () => {
    let denied = 0
    const n = 20000
    for (let i = 0; i < n; i++) if (isRandomlyDenied(crypto.randomUUID())) denied++
    expect(denied / n).toBeGreaterThan(0.085)
    expect(denied / n).toBeLessThan(0.115)
  })

  it('is stable for a given wish', () => {
    const id = '00000000-0000-4000-8000-000000000007'
    expect(isRandomlyDenied(id)).toBe(isRandomlyDenied(id))
  })

  it('lets you stamp and unstamp locally', () => {
    // find a wish that is not randomly denied
    const id = Array.from({ length: 50 }, () => crypto.randomUUID()).find((x) => !isRandomlyDenied(x))!
    expect(isDenied(id)).toBe(false)
    setLocallyDenied(id, true)
    expect(isLocallyDenied(id)).toBe(true)
    expect(isDenied(id)).toBe(true)
    setLocallyDenied(id, false)
    expect(isDenied(id)).toBe(false)
  })
})
