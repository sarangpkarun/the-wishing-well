import {
  ALIAS_BILLIONAIRES,
  ALIAS_PREFIXES,
  NOBLE_NAMES,
  NOBLE_SUFFIXES,
  NOBLE_TITLES,
} from '../config/aliases'
import { pick, type Rng } from './random'

// Matches the sender_alias CHECK in the database.
export const MAX_ALIAS_LENGTH = 60

/** Random fake billionaire: "Sir Moneybags the 3rd" or "Definitely Not Ambani". */
export function generateAlias(rng: Rng = Math.random): string {
  const alias =
    rng() < 0.5
      ? `${pick(NOBLE_TITLES, rng)} ${pick(NOBLE_NAMES, rng)}${pick(NOBLE_SUFFIXES, rng)}`
      : `${pick(ALIAS_PREFIXES, rng)} ${pick(ALIAS_BILLIONAIRES, rng)}`
  return alias.slice(0, MAX_ALIAS_LENGTH)
}
