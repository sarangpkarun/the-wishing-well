// A sender's alias sticks to their browser, so "most generous" and net worth mean something.
// (Aliases are only ever generated, never typed, so nobody can claim someone else's by typing it.)
const KEY = 'wishing-well:alias'

export function getSavedAlias(): string | null {
  try {
    return localStorage.getItem(KEY) || null
  } catch {
    return null
  }
}

export function saveAlias(alias: string): void {
  try {
    localStorage.setItem(KEY, alias)
  } catch {
    /* storage unavailable: a fresh alias is used next time */
  }
}
