import { describe, expect, it } from 'vitest'
import { generateAlias, MAX_ALIAS_LENGTH } from '../lib/alias'
import { seededRng } from '../lib/random'
import { ALIAS_BILLIONAIRES, ALIAS_PREFIXES, NOBLE_NAMES, NOBLE_SUFFIXES, NOBLE_TITLES } from './aliases'
import { GIFT_CATALOG, getGift, MYSTERY_GIFT } from './giftCatalog'

describe('gift catalog', () => {
  it('has 15-20 gifts with unique, database-safe ids', () => {
    expect(GIFT_CATALOG.length).toBeGreaterThanOrEqual(15)
    expect(GIFT_CATALOG.length).toBeLessThanOrEqual(20)
    const ids = GIFT_CATALOG.map((g) => g.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]{1,64}$/) // gifts.gift_type CHECK
  })

  it('has every field filled in', () => {
    for (const g of GIFT_CATALOG) {
      for (const f of [g.name, g.emoji, g.price, g.description, g.revealLine]) expect(f.trim()).not.toBe('')
    }
  })

  it('includes the required gifts', () => {
    const names = GIFT_CATALOG.map((g) => g.name.toLowerCase()).join('|')
    for (const needle of ['stale samosa', 'kevin', "i'm broke but i believe in you", 'yacht', "ex's number", 'non-refundable'])
      expect(names).toContain(needle)
  })

  it('falls back to a mystery gift for unknown ids', () => {
    expect(getGift('nope')).toBe(MYSTERY_GIFT)
    expect(getGift('stale-samosa').name).toMatch(/Samosa/)
  })
})

describe('alias generator', () => {
  it('always fits the database limit, across every combination style', () => {
    for (let seed = 0; seed < 2000; seed++) {
      const a = generateAlias(seededRng(seed))
      expect(a.length).toBeGreaterThan(3)
      expect(a.length).toBeLessThanOrEqual(MAX_ALIAS_LENGTH)
    }
  })

  it('worst-case lengths fit without truncation', () => {
    const longest = (xs: string[]) => Math.max(...xs.map((x) => x.length))
    expect(longest(NOBLE_TITLES) + 1 + longest(NOBLE_NAMES) + longest(NOBLE_SUFFIXES)).toBeLessThanOrEqual(MAX_ALIAS_LENGTH)
    expect(longest(ALIAS_PREFIXES) + 1 + longest(ALIAS_BILLIONAIRES)).toBeLessThanOrEqual(MAX_ALIAS_LENGTH)
  })

  it('produces both styles and plenty of variety', () => {
    const seen = new Set<string>()
    for (let seed = 0; seed < 300; seed++) seen.add(generateAlias(seededRng(seed)))
    expect(seen.size).toBeGreaterThan(100)
    expect([...seen].some((a) => NOBLE_TITLES.some((t) => a.startsWith(t + ' ')))).toBe(true)
    expect([...seen].some((a) => ALIAS_PREFIXES.some((p) => a.startsWith(p + ' ')))).toBe(true)
  })
})
