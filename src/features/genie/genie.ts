// Feature: Random Genie. Grants a random (useless) gift to a random wish.
// This file is pure logic (no network) so it can be unit tested; see summon.ts for the database call.
import { GIFT_CATALOG, type CatalogGift } from '../../config/giftCatalog'
import { pick, type Rng } from '../../lib/random'
import type { Wish } from '../../types'

export const GENIE_ALIAS = 'The Unlicensed Genie'
/** Client-side politeness: one wish per this many ms. The real limit belongs on the server (see the migration notes). */
export const GENIE_COOLDOWN_MS = 8000

export const GENIE_MESSAGES = [
  'Your wish was granted. The Genie does not do refunds.',
  'The Genie was aiming for something else. Enjoy.',
  'Three wishes? Please. You get one, and it is this.',
  'The Genie read the small print. There was no small print.',
  'Rubbed the wrong lamp. Got this instead.',
  'Granted in the most literal way possible.',
]

/** A random wish that isn't one of mine (the Genie doesn't do self-service). */
export function pickGenieTarget(wishes: readonly Wish[], excludeIds: ReadonlySet<string>, rng: Rng = Math.random): Wish | null {
  const pool = wishes.filter((w) => !excludeIds.has(w.id))
  return pool.length > 0 ? pick(pool, rng) : null
}

export const pickGenieGift = (rng: Rng = Math.random): CatalogGift => pick(GIFT_CATALOG, rng)
