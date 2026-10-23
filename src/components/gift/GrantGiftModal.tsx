import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { CatalogGift } from '../../config/giftCatalog'
import { AliasWealth } from '../../features/wealth'
import { generateAlias } from '../../lib/alias'
import { getSavedAlias, saveAlias } from '../../lib/aliasStore'
import { grantGift } from '../../lib/api'
import { checkText } from '../../lib/moderation'
import type { Gift, Wish } from '../../types'
import { Modal } from '../ui/Modal'
import { GiftCatalogGrid } from './GiftCatalogGrid'

const MAX_MESSAGE = 140

interface Props {
  wish: Wish
  open: boolean
  onClose: () => void
  /** Fired once the gift is stored, so the page can add it to the timeline. */
  onGranted: (g: Gift, gift: CatalogGift) => void
}

/** Pick a gift -> optional anonymous message -> send, signed with a random fake billionaire alias. */
export function GrantGiftModal({ wish, open, onClose, onGranted }: Props) {
  const [gift, setGift] = useState<CatalogGift | null>(null)
  const [alias, setAlias] = useState(() => getSavedAlias() ?? generateAlias())
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState<{ gift: Gift; item: CatalogGift } | null>(null)

  function reset() {
    setGift(null)
    setMessage('')
    setError(null)
    setSent(null)
    setAlias(getSavedAlias() ?? generateAlias())
  }

  function close() {
    onClose()
    // Reset after the exit animation so the content doesn't flash empty.
    setTimeout(reset, 250)
  }

  async function send() {
    if (!gift || busy) return
    const problem = message.trim() ? checkText(message, 1, MAX_MESSAGE) : null
    if (problem) return setError(problem)
    setBusy(true)
    setError(null)
    try {
      const stored = await grantGift({ wishId: wish.id, giftType: gift.id, alias, message })
      saveAlias(alias) // the alias is now "yours": it sticks until you reroll and send again
      setSent({ gift: stored, item: gift })
      onGranted(stored, gift)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={close} title={sent ? 'Wish granted! 🎉' : 'Grant this wish 🎁'}>
      {sent ? (
        <div className="space-y-4 py-4 text-center">
          <div className="text-7xl">{sent.item.emoji}</div>
          <p className="text-lg">
            <b>{sent.item.name}</b> has been sent as
          </p>
          <p className="gold-text font-title text-2xl font-black">{alias}</p>
          <p className="text-sm text-gold-200/60">Nothing was actually delivered. The thought was the gift.</p>
          <AliasWealth alias={alias} />
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link to={`/wish/${wish.id}/reveal/${sent.gift.id}`} className="btn-gold">
              See the receipt 🧾
            </Link>
            <button className="btn-ghost" onClick={reset}>
              Send another
            </button>
            <button className="btn-ghost" onClick={close}>
              Done
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-gold-200/70">“{wish.text}”</p>
          <GiftCatalogGrid selected={gift?.id ?? null} onSelect={setGift} />

          {/* Sticky so Send stays reachable on phones even with 18 gifts to scroll past. */}
          <div className="sticky bottom-0 -mx-5 -mb-5 mt-5 space-y-3 border-t border-gold-500/30 bg-well-800 p-5">
            {gift ? (
              <p className="text-sm">
                <b>
                  {gift.emoji} {gift.name}
                </b>
                <span className="block text-xs text-gold-200/60">Value: {gift.price}</span>
              </p>
            ) : (
              <p className="text-sm text-gold-200/60">Pick a gift above.</p>
            )}

            <div className="flex items-center gap-2">
              <div className="input flex-1 !bg-gold-400/10 text-gold-300" aria-label="Your alias">
                {alias}
              </div>
              <button type="button" className="btn-ghost" onClick={() => setAlias(generateAlias())}>
                🎲 Reroll
              </button>
            </div>

            <div>
              <input
                className="input"
                placeholder="Anonymous message (optional)"
                aria-label="Anonymous message"
                maxLength={MAX_MESSAGE}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <div className="mt-1 text-right text-xs text-gold-200/50">
                {message.length}/{MAX_MESSAGE}
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-300" role="alert">
                {error}
              </p>
            )}
            <button className="btn-gold w-full" onClick={send} disabled={!gift || busy}>
              {busy ? 'Summoning courier…' : 'Send it (nothing will happen) 🚀'}
            </button>
          </div>
        </>
      )}
    </Modal>
  )
}
