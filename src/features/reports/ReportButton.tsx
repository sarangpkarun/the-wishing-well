import { useState } from 'react'
import { Modal } from '../../components/ui/Modal'
import { reportWish } from './api'
import { hasReported, MAX_DETAILS, REASONS, type ReportReason } from './reports'

/** "Report" link + modal. Self-contained: drop it on any wish. */
export function ReportButton({ wishId }: { wishId: string }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<ReportReason | null>(null)
  const [details, setDetails] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(() => hasReported(wishId))
  const [justSent, setJustSent] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!reason || busy) return
    setBusy(true)
    setError(null)
    try {
      await reportWish(wishId, reason, details)
      setDone(true)
      setJustSent(true)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  function close() {
    setOpen(false)
    setTimeout(() => setJustSent(false), 250)
  }

  return (
    <>
      <button
        className="text-xs text-gold-200/50 underline-offset-2 hover:text-gold-200 hover:underline disabled:no-underline"
        onClick={() => setOpen(true)}
        disabled={done}
      >
        {done ? '🚩 Reported. Thank you.' : '🚩 Report this wish'}
      </button>

      <Modal open={open} onClose={close} title={justSent ? 'Report received' : 'Report this wish'}>
        {justSent ? (
          <div className="space-y-4 py-2 text-center">
            <div className="text-6xl">🐦</div>
            <p>Thank you. A pigeon has been dispatched to review it.</p>
            <p className="text-sm text-gold-200/60">The pigeon is lost, but a human will look too.</p>
            <button className="btn-gold" onClick={close}>
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <fieldset className="space-y-2">
              <legend className="mb-1 text-sm text-gold-200/70">What's wrong with it?</legend>
              {REASONS.map((r) => (
                <label
                  key={r.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2 transition ${
                    reason === r.value ? 'border-gold-400 bg-gold-400/10' : 'border-gold-500/30 hover:bg-gold-400/5'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                    className="mt-1 accent-[#f5c542]"
                  />
                  <span>
                    <span className="block font-semibold leading-tight">{r.label}</span>
                    <span className="block text-xs text-gold-200/60">{r.hint}</span>
                  </span>
                </label>
              ))}
            </fieldset>

            <div>
              <label htmlFor="report-details" className="mb-1 block text-sm text-gold-200/70">
                Anything else? <span className="text-gold-200/40">(optional)</span>
              </label>
              <textarea
                id="report-details"
                className="input min-h-20 resize-none"
                maxLength={MAX_DETAILS}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
              <div className="mt-1 text-right text-xs text-gold-200/50">
                {details.length}/{MAX_DETAILS}
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-300" role="alert">
                {error}
              </p>
            )}
            <button className="btn-gold w-full" disabled={!reason || busy}>
              {busy ? 'Dispatching pigeon…' : 'Send report'}
            </button>
          </form>
        )}
      </Modal>
    </>
  )
}
