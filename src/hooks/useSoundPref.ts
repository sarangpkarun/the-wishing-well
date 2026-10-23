import { useCallback, useState } from 'react'

const KEY = 'wishing-well:sound'

function read(): boolean {
  try {
    return localStorage.getItem(KEY) === 'on'
  } catch {
    return false
  }
}

/** Sound is OFF unless the visitor turned it on before. Persisted per browser. */
export function useSoundPref() {
  const [enabled, setEnabled] = useState(read)

  const set = useCallback((on: boolean) => {
    setEnabled(on)
    try {
      localStorage.setItem(KEY, on ? 'on' : 'off')
    } catch {
      /* storage unavailable: the choice just won't persist */
    }
  }, [])

  return { enabled, set }
}
