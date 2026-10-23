// Feature: pigeon profile. Pigeons are just catalog gifts whose id starts with "pigeon-",
// so adding a new pigeon gift to the catalog automatically adds it to every profile.
import { GIFT_CATALOG, getGift } from '../../config/giftCatalog'
import { hashString } from '../../lib/random'

export const PIGEONS = GIFT_CATALOG.filter((g) => g.id.startsWith('pigeon-'))
export const PIGEON_IDS = PIGEONS.map((g) => g.id)
export const isPigeon = (giftType: string): boolean => giftType.startsWith('pigeon-')

const STATUSES = [
  'Lost',
  'Judging you from a ledge',
  'Unionising',
  'Has forgotten the address',
  'Delivering opinions, not parcels',
  'Stuck in a revolving door',
  'Arguing with a crow',
  'On a break (indefinite)',
]

/** 60-100%: how lost this particular pigeon is. Stable per gift. */
export const lostness = (giftId: string): number => 60 + (hashString(`lost:${giftId}`) % 41)

export const pigeonStatus = (giftId: string): string => STATUSES[hashString(`status:${giftId}`) % STATUSES.length]

export interface PigeonStats {
  total: number
  breeds: number
  /** Average lostness, 0 when there are no pigeons. */
  avgLost: number
}

export function pigeonStats(gifts: { id: string; gift_type: string }[]): PigeonStats {
  if (gifts.length === 0) return { total: 0, breeds: 0, avgLost: 0 }
  return {
    total: gifts.length,
    breeds: new Set(gifts.map((g) => getGift(g.gift_type).id)).size,
    avgLost: Math.round(gifts.reduce((sum, g) => sum + lostness(g.id), 0) / gifts.length),
  }
}
