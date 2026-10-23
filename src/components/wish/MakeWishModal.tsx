import { useState } from 'react'
import { createWish } from '../../lib/api'
import { checkText } from '../../lib/moderation'
import { rememberWish } from '../../lib/myWishes'
import type { Wish } from '../../types'
import { Modal } from '../ui/Modal'
import { DEFAULT_WISHER } from '../../lib/format'

const MAX = 200
const EXAMPLES = [
  'I want a pizza',
  'I want my ex to see me thriving',
  'I want a nap that lasts 3 business days',
  'I want my WiFi to work on the first try',
]

interface Props {
  open: boolean
  onClose: () => void
  onCreated: (w: Wish) => void
}

export function MakeWishModal({ open, onClose, onCreated }: Props) {
  const [text, setText] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function close() {
    setError(null)
    onClose()
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return
    const problem = checkText(text, 3, MAX) ?? (name.trim() ? checkText(name, 1, 40) : null)
    if (problem) return setError(problem)
    setBusy(true)
    setError(null)
    try {
      const wish = await createWish(text, name)
      rememberWish(wish.id)
      setText('')
      onCreated(wish)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={close} title="Make a wish ✨">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="wish-text" className="mb-1 block text-sm text-gold-200/70">
            What do you want?
          </label>
          <textarea
            id="wish-text"
            className="input min-h-28 resize-none"
            placeholder="I want..."
            maxLength={MAX}
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoFocus
          />
          <div className="mt-1 text-right text-xs text-gold-200/50">
            {text.length}/{MAX}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              type="button"
              key={ex}
              className="rounded-full border border-gold-500/30 px-3 py-1 text-xs hover:bg-gold-400/15"
              onClick={() => setText(ex)}
            >
              {ex}
            </button>
          ))}
        </div>

        <div>
          <label htmlFor="wish-name" className="mb-1 block text-sm text-gold-200/70">
            Your name <span className="text-gold-200/40">(optional)</span>
          </label>
          <input
            id="wish-name"
            className="input"
            placeholder={DEFAULT_WISHER}
            maxLength={40}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <p className="text-xs text-gold-200/50">No phone numbers, emails, links or rude words. The well is classy.</p>
        {error && (
          <p className="text-sm text-red-300" role="alert">
            {error}
          </p>
        )}
        <button className="btn-gold w-full" disabled={busy || text.trim().length < 3}>
          {busy ? 'Tossing coin…' : 'Toss into the well 🪙'}
        </button>
      </form>
    </Modal>
  )
}
