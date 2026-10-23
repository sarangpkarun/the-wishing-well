import { describe, expect, it } from 'vitest'
import { netWorth } from './wealth'

const ALIASES = ['Sir Moneybags the 3rd', 'Definitely Not Ambani', 'The Unlicensed Genie', 'Baron Von Splurge Jr.']

describe('netWorth', () => {
  it('starts at zero', () => {
    const w = netWorth('Sir Moneybags the 3rd', 0)
    expect(w.fill).toBe(0)
    expect(w.amount).toContain('rumoured')
  })

  it('gauge strictly rises with every gift and never reaches 100%', () => {
    for (const alias of ALIASES) {
      let prev = -1
      for (let n = 0; n <= 60; n++) {
        const { fill } = netWorth(alias, n)
        expect(fill).toBeGreaterThan(prev)
        expect(fill).toBeLessThan(1)
        prev = fill
      }
    }
  })

  it('magnitude never goes down as gifts are added', () => {
    for (const alias of ALIASES) {
      let prev = 0
      for (let n = 0; n <= 40; n++) {
        const { level } = netWorth(alias, n)
        expect(level).toBeGreaterThanOrEqual(prev)
        prev = level
      }
    }
  })

  it('is deterministic and keeps the same unit for an alias', () => {
    const a = netWorth('Definitely Not Ambani', 3)
    expect(netWorth('Definitely Not Ambani', 3)).toEqual(a)
    const unit = (n: number) => netWorth('Definitely Not Ambani', n).amount.split(' ').slice(2).join(' ')
    expect(unit(2).startsWith(unit(5).split(' ')[0])).toBe(true)
  })

  it('never renders garbage', () => {
    for (const alias of ALIASES)
      for (let n = 0; n <= 100; n++) {
        const w = netWorth(alias, n)
        for (const s of [w.amount, w.tier, w.sideNote]) expect(s).not.toMatch(/NaN|undefined|null/)
      }
  })

  it('treats bad counts as zero', () => {
    expect(netWorth('x', -4).fill).toBe(0)
    expect(netWorth('x', 2.9).level).toBe(2)
  })
})
