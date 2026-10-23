import { useState } from 'react'
import { isLocallyDenied, isRandomlyDenied, setLocallyDenied } from './denied'
import { DeniedStamp } from './DeniedStamp'

/** Shows the stamp (if denied) plus a button to stamp it yourself. Self-contained: drop it on a wish page. */
export function DeniedControls({ wishId }: { wishId: string }) {
  const auto = isRandomlyDenied(wishId)
  const [local, setLocal] = useState(() => isLocallyDenied(wishId))
  const [appealed, setAppealed] = useState(false)
  const denied = auto || local

  function toggle() {
    setLocallyDenied(wishId, !local)
    setLocal(!local)
  }

  return (
    <div className="space-y-3 text-center">
      {denied && <DeniedStamp size="page" />}
      {auto ? (
        <div>
          <button className="btn-ghost text-sm" onClick={() => setAppealed(true)} disabled={appealed}>
            {appealed ? 'Appeal denied.' : 'Appeal this decision'}
          </button>
          {appealed && <p className="mt-1 text-xs text-gold-200/60">The committee has reviewed your appeal. It was a pigeon. It said no.</p>}
        </div>
      ) : (
        <div>
          <button className="btn-ghost text-sm" onClick={toggle}>
            {local ? 'Remove my stamp' : '🟥 Stamp it DENIED'}
          </button>
          <p className="mt-1 text-xs text-gold-200/40">Only you can see your stamp. The well does not take sides.</p>
        </div>
      )}
    </div>
  )
}
