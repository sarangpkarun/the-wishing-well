import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { toBlob } from 'html-to-image'
import { CARD_HEIGHT, CARD_WIDTH } from './shareCard'
import { ShareCard, type ShareCardProps } from './ShareCard'

const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()))

/** Renders the card off-screen at its true 1080x1350 size and returns it as a PNG of exactly that size. */
export async function renderShareCardBlob(props: ShareCardProps): Promise<Blob> {
  const host = document.createElement('div')
  host.setAttribute('aria-hidden', 'true')
  Object.assign(host.style, {
    position: 'fixed',
    top: '0',
    left: '-20000px', // off-screen but still laid out, so fonts and emoji render
    width: `${CARD_WIDTH}px`,
    height: `${CARD_HEIGHT}px`,
    pointerEvents: 'none',
  })
  document.body.appendChild(host)
  const root = createRoot(host)
  try {
    flushSync(() => root.render(<ShareCard {...props} />))
    await document.fonts?.ready
    await nextFrame()
    await nextFrame()

    const node = host.firstElementChild as HTMLElement
    const opts = {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      pixelRatio: 1, // exactly 1080x1350 regardless of the device's pixel ratio
      cacheBust: true,
      backgroundColor: '#070504',
    }
    try {
      const blob = await toBlob(node, opts)
      if (blob) return blob
    } catch {
      /* web-font inlining can fail offline or behind blockers; retry with system fonts */
    }
    const blob = await toBlob(node, { ...opts, skipFonts: true })
    if (!blob) throw new Error('Could not render the card')
    return blob
  } finally {
    root.unmount()
    host.remove()
  }
}
