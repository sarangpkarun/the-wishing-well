// No accounts: remember which wishes this browser created so "My wishes" and the
// owner view on a wish page work. Purely local; clearing site data forgets them.
const KEY = 'wishing-well:my-wishes'

export function getMyWishIds(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

export function rememberWish(id: string): void {
  try {
    localStorage.setItem(KEY, JSON.stringify([id, ...getMyWishIds().filter((x) => x !== id)].slice(0, 100)))
  } catch {
    /* storage unavailable (private mode): the wish still exists, we just can't list it */
  }
}

export const isMyWish = (id: string): boolean => getMyWishIds().includes(id)

// Which gifts this browser has already opened, so the wish page can nag about new ones.
const OPENED_KEY = 'wishing-well:opened-gifts'

export function getOpenedGiftIds(): Set<string> {
  try {
    const raw = JSON.parse(localStorage.getItem(OPENED_KEY) ?? '[]')
    return new Set(Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string') : [])
  } catch {
    return new Set()
  }
}

export function markGiftOpened(id: string): void {
  try {
    const ids = [...getOpenedGiftIds().add(id)].slice(-500)
    localStorage.setItem(OPENED_KEY, JSON.stringify(ids))
  } catch {
    /* ignore */
  }
}
