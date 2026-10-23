import type { ReceiptData } from '../../types'

/** Static (no animation) so it screenshots cleanly. Done steps are ticked; the last one is "now". */
export function DeliveryTracker({ steps }: { steps: ReceiptData['tracker'] }) {
  return (
    <ol className="space-y-0" aria-label="Delivery tracker">
      {steps.map((s, i) => {
        const last = i === steps.length - 1
        return (
          <li key={i} className="relative flex gap-3 pb-3 last:pb-0">
            {!last && <span className="absolute left-[9px] top-5 h-[calc(100%-12px)] w-px bg-stone-400" aria-hidden />}
            <span
              className={`relative z-10 mt-0.5 flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold leading-none ${
                s.done ? 'border-stone-800 bg-stone-800 text-paper' : 'border-red-700 bg-paper text-red-700'
              }`}
              aria-hidden
            >
              {s.done ? '✓' : '!'}
            </span>
            <span className={`text-[12px] leading-snug ${s.done ? 'text-stone-600' : 'font-bold text-red-800'}`}>
              {last && <span className="mb-0.5 block text-[10px] uppercase tracking-widest text-red-700">Current status</span>}
              {s.status}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
