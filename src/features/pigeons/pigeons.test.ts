import { describe, expect, it } from 'vitest'
import { GIFT_CATALOG } from '../../config/giftCatalog'
import { isPigeon, lostness, PIGEON_IDS, PIGEONS, pigeonStats, pigeonStatus } from './pigeons'

describe('pigeons', () => {
  it('finds every pigeon gift in the catalog, and Kevin is one of them', () => {
    expect(PIGEONS.length).toBeGreaterThanOrEqual(3)
    expect(PIGEON_IDS).toContain('pigeon-kevin')
    for (const id of PIGEON_IDS) expect(GIFT_CATALOG.some((g) => g.id === id)).toBe(true)
    expect(isPigeon('stale-samosa')).toBe(false)
  })

  it('lostness is 60-100 and stable', () => {
    for (let i = 0; i < 500; i++) {
      const id = crypto.randomUUID()
      const l = lostness(id)
      expect(l).toBeGreaterThanOrEqual(60)
      expect(l).toBeLessThanOrEqual(100)
      expect(lostness(id)).toBe(l)
      expect(pigeonStatus(id)).toBe(pigeonStatus(id))
    }
  })

  it('computes stats, including the empty case', () => {
    expect(pigeonStats([])).toEqual({ total: 0, breeds: 0, avgLost: 0 })
    const s = pigeonStats([
      { id: 'a', gift_type: 'pigeon-kevin' },
      { id: 'b', gift_type: 'pigeon-kevin' },
      { id: 'c', gift_type: 'pigeon-gerald' },
    ])
    expect(s.total).toBe(3)
    expect(s.breeds).toBe(2)
    expect(s.avgLost).toBeGreaterThanOrEqual(60)
  })
})
