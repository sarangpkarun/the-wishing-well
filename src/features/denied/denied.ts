// Feature: "Wish Denied" stamp.
//
// ~10% of wishes are stamped DENIED automatically. "Random" is derived from a hash of the
// wish id, so a given wish is always (or never) denied and every visitor sees the same
// thing. The schema forbids updates, so the "apply it yourself" button is local to the
// visitor's browser; it doesn't change what anyone else sees.
import { hashString } from '../../lib/random'

export const DENIED_PERCENT = 10
const KEY = 'wishing-well:denied-local'

export const isRandomlyDenied = (wishId: string): boolean => hashString(`denied:${wishId}`) % 100 < DENIED_PERCENT

function readLocal(): Set<string> {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return new Set(Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string') : [])
  } catch {
    return new Set()
  }
}

export const isLocallyDenied = (wishId: string): boolean => readLocal().has(wishId)

export function setLocallyDenied(wishId: string, on: boolean): void {
  try {
    const ids = readLocal()
    if (on) ids.add(wishId)
    else ids.delete(wishId)
    localStorage.setItem(KEY, JSON.stringify([...ids].slice(-500)))
  } catch {
    /* storage unavailable: the stamp just won't stick */
  }
}

export const isDenied = (wishId: string): boolean => isRandomlyDenied(wishId) || isLocallyDenied(wishId)
