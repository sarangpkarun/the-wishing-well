import { forwardRef } from 'react'
import { receiptForGift } from '../../lib/receipt'
import type { Gift } from '../../types'
import { DeliveryTracker } from './DeliveryTracker'

const PAPER = '#fbf7ea'

/** Fake barcode: bar widths come from the transaction id, so it's stable per gift. */
function Barcode({ code }: { code: string }) {
  const bars = [...code, ...code].map((ch, i) => ({ w: 1 + (ch.charCodeAt(0) + i) % 4, gap: 1 + (ch.charCodeAt(0) % 2) }))
  return (
    <div className="flex h-10 items-stretch justify-center overflow-hidden" aria-hidden>
      {bars.map((b, i) => (
        <span key={i} className="bg-stone-800" style={{ width: b.w, marginRight: b.gap }} />
      ))}
    </div>
  )
}

const Row = ({ label, value, strong }: { label: string; value: string; strong?: boolean }) => (
  <div className="flex justify-between gap-4">
    <dt>{label}</dt>
    <dd className={`text-right ${strong ? 'font-bold' : ''}`}>{value}</dd>
  </div>
)

/**
 * The ref lands on the outer frame (dark gold backdrop + paper), which is what gets
 * captured for the PNG: fixed width, solid colours, no animation, no masks or filters.
 */
export const Receipt = forwardRef<HTMLDivElement, { gift: Gift }>(function Receipt({ gift }, ref) {
  const r = receiptForGift(gift)
  const issued = new Date(r.issuedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  const item = r.items[0]

  return (
    <div ref={ref} className="mx-auto w-full max-w-[420px] bg-well-900 p-5">
      <div className="bg-paper px-5 pt-6 font-mono text-[13px] leading-snug text-stone-900" style={{ backgroundColor: PAPER }}>
        <header className="text-center">
          <div className="text-4xl leading-none">{r.giftEmoji}</div>
          <h3 className="mt-2 text-lg font-bold uppercase tracking-[0.25em]">The Wishing Well</h3>
          <p className="text-xs uppercase tracking-widest text-stone-600">Official-ish Receipt</p>
          <p className="mt-1 text-xs text-stone-600">{issued}</p>
        </header>

        <hr className="my-4 border-dashed border-stone-500" />

        <div className="text-[11px] uppercase tracking-widest text-stone-600">Itemised</div>
        <div className="mt-1 flex justify-between gap-4">
          <span>
            {item.qty} × <b>{item.name}</b>
          </span>
        </div>
        <div className="text-right text-[12px] text-stone-700">{item.price}</div>

        <dl className="mt-3 space-y-1">
          <Row label="Wish Processing Fee" value={r.fee} />
          <Row label="GST" value={r.gst} />
          {r.extras.map((e) => (
            <Row key={e.label} label={e.label} value={e.value} />
          ))}
        </dl>

        <hr className="my-4 border-dashed border-stone-500" />
        <div className="flex items-baseline justify-between gap-4 text-base font-bold">
          <span>TOTAL</span>
          <span className="text-right">{r.total}</span>
        </div>
        <hr className="my-4 border-dashed border-stone-500" />

        <p className="text-center text-xs">
          Gifted by
          <br />
          <b className="text-sm">{gift.sender_alias}</b>
        </p>
        {gift.message && <p className="mt-2 break-words text-center text-xs italic">“{gift.message}”</p>}

        <hr className="my-4 border-dashed border-stone-500" />
        <div className="mb-2 text-[11px] uppercase tracking-widest text-stone-600">Delivery tracker</div>
        <DeliveryTracker steps={r.tracker} />

        <hr className="my-4 border-dashed border-stone-500" />
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-widest text-stone-600">Transaction ID</div>
          <div className="mb-3 text-sm font-bold tracking-wider">{r.txnId}</div>
          <Barcode code={r.txnId} />
        </div>
        <p className="mt-4 pb-3 text-center text-[11px] text-stone-600">{r.footer}</p>
      </div>
      {/* Zigzag torn edge: paper-coloured teeth over the dark frame, plain gradients so it survives PNG capture. */}
      <div
        aria-hidden
        className="h-3"
        style={{
          backgroundImage: `linear-gradient(135deg, ${PAPER} 50%, transparent 50%), linear-gradient(225deg, ${PAPER} 50%, transparent 50%)`,
          backgroundSize: '12px 12px',
          backgroundPosition: '0 0',
        }}
      />
      <p className="mt-3 text-center text-[10px] uppercase tracking-[0.2em] text-gold-500">
        The Wishing Well · nothing here is real
      </p>
    </div>
  )
})
