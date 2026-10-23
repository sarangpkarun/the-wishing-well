import { describe, expect, it } from 'vitest'
import { GIFT_CATALOG } from '../../config/giftCatalog'
import { seededRng } from '../../lib/random'
import type { Wish } from '../../types'
import { pickGenieGift, pickGenieTarget } from './genie'

const wish = (id: string): Wish => ({ id, text: id, wisher_name: null, created_at: '2026-01-01T00:00:00Z', gift_count: 0 })

describe('genie', () => {
  const wishes = ['a', 'b', 'c', 'd'].map(wish)

  it('never picks an excluded (own) wish', () => {
    for (let seed = 0; seed < 200; seed++) {
      const w = pickGenieTarget(wishes, new Set(['a', 'b', 'c']), seededRng(seed))
      expect(w?.id).toBe('d')
    }
  })

  it('returns null when every wish is excluded or there are none', () => {
    expect(pickGenieTarget(wishes, new Set(['a', 'b', 'c', 'd']))).toBeNull()
    expect(pickGenieTarget([], new Set())).toBeNull()
  })

  it('can reach every eligible wish', () => {
    const seen = new Set<string>()
    for (let seed = 0; seed < 200; seed++) seen.add(pickGenieTarget(wishes, new Set(), seededRng(seed))!.id)
    expect(seen.size).toBe(4)
  })

  it('picks gifts from the catalog', () => {
    for (let seed = 0; seed < 50; seed++) expect(GIFT_CATALOG).toContain(pickGenieGift(seededRng(seed)))
  })
})
