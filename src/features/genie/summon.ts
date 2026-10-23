import type { Gift, Wish } from '../../types'
import type { CatalogGift } from '../../config/giftCatalog'
import { grantGift } from '../../lib/api'
import { getMyWishIds } from '../../lib/myWishes'
import { pick, type Rng } from '../../lib/random'
import { GENIE_ALIAS, GENIE_MESSAGES, pickGenieGift, pickGenieTarget } from './genie'

export interface GenieResult {
  wish: Wish
  gift: Gift
  item: CatalogGift
}

/** Returns null when there is nothing to grant. Throws on database errors (rate limits etc.). */
export async function summonGenie(wishes: readonly Wish[], rng: Rng = Math.random): Promise<GenieResult | null> {
  const wish = pickGenieTarget(wishes, new Set(getMyWishIds()), rng)
  if (!wish) return null
  const item = pickGenieGift(rng)
  const gift = await grantGift({
    wishId: wish.id,
    giftType: item.id,
    alias: GENIE_ALIAS,
    message: pick(GENIE_MESSAGES, rng),
  })
  return { wish, gift, item }
}
