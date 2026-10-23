import { useEffect, useState } from 'react'
import { Modal } from '../../components/ui/Modal'
import { getGift } from '../../config/giftCatalog'
import type { Gift } from '../../types'
import { renderShareCardBlob } from './renderShareCard'
import { SHARE_TEXT, SHARE_TITLE, shareFilename } from './shareCard'
import { downloadBlob, shareOrDownload } from './shareImage'

interface Props {
  gift: Gift
  /** The wish text; falls back to a generic line if it couldn't be loaded. */
  wishText: string | null
  mine: boolean
  className?: string
}

/**
 * "Share" -> renders the card -> preview. The share/download happens on the *second* tap, from
 * the preview, so it's a fresh user gesture (Safari rejects share() after a slow async render).
 */
export function ShareButton({ gift, wishText, mine, className = 'btn-gold' }: Props) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [card, setCard] = useState<{ blob: Blob; url: string } | null>(null)
  const [note, setNote] = useState<string | null>(null)

  // Free the preview's object URL when it changes or the button unmounts.
  useEffect(() => {
    if (!card) return
    return () => URL.revokeObjectURL(card.url)
  }, [card])

  async function make() {
    if (busy) return
    setBusy(true)
    setError(null)
    setNote(null)
    try {
      const blob = await renderShareCardBlob({
        wishText: wishText ?? 'A mysterious wish',
        giftType: gift.gift_type,
        alias: gift.sender_alias,
        mine,
      })
      setCard({ blob, url: URL.createObjectURL(blob) })
    } catch {
      setError('Could not make the card. Try a screenshot instead!')
    } finally {
      setBusy(false)
    }
  }

  async function share() {
    if (!card) return
    const outcome = await shareOrDownload(card.blob, shareFilename(gift.id), { title: SHARE_TITLE, text: SHARE_TEXT })
    setNote(outcome === 'downloaded' ? 'Saved to your downloads.' : outcome === 'shared' ? 'Shared!' : null)
  }

  return (
    <>
      <button className={className} onClick={make} disabled={busy}>
        {busy ? 'Gilding the card…' : 'Share 🖼️'}
      </button>
      {error && (
        <p className="mt-2 text-center text-sm text-red-300" role="alert">
          {error}
        </p>
      )}

      <Modal open={card !== null} onClose={() => setCard(null)} title="Your wish card">
        {card && (
          <div className="space-y-4">
            {/* Shown small; the file itself is a full 1080x1350 PNG. */}
            <img
              src={card.url}
              alt={`Wish card: ${wishText ?? 'a mysterious wish'}, granted with ${getGift(gift.gift_type).name} by ${gift.sender_alias}`}
              className="mx-auto max-h-[60vh] w-auto rounded-xl border border-gold-500/40 shadow-[0_0_30px_rgba(245,197,66,0.25)]"
              width={1080}
              height={1350}
            />
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button className="btn-gold" onClick={share}>
                Share 📤
              </button>
              <button className="btn-ghost" onClick={() => downloadBlob(card.blob, shareFilename(gift.id))}>
                Download PNG
              </button>
            </div>
            {note && (
              <p className="text-center text-sm text-gold-200/70" role="status">
                {note}
              </p>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}
