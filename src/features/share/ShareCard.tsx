import type { CSSProperties } from 'react'
import { getGift } from '../../config/giftCatalog'
import { CARD_HEIGHT, CARD_WIDTH, FOOTER_TEXT, cardLayout } from './shareCard'

export interface ShareCardProps {
  wishText: string
  giftType: string
  alias: string
  /** The wisher sees "Your wish"; anyone else sees a neutral headline. */
  mine: boolean
}

const GOLD = '#f5c542'
const GOLD_LIGHT = '#ffe38a'
const CREAM = '#fff1b8'
const TITLE_FONT = '"Cinzel Decorative", "Playfair Display", Georgia, serif'
const BODY_FONT = '"Playfair Display", Georgia, serif'

// Static glitter: tiny dots tiled at co-prime sizes so they never look like a grid.
const GLITTER: CSSProperties = {
  position: 'absolute',
  inset: 0,
  backgroundImage: [
    `radial-gradient(circle, ${CREAM} 0 2px, transparent 3px)`,
    `radial-gradient(circle, ${GOLD} 0 2px, transparent 3px)`,
    'radial-gradient(circle, #ffffff 0 1.5px, transparent 2.5px)',
  ].join(','),
  backgroundSize: '181px 181px, 127px 127px, 263px 263px',
  backgroundPosition: '20px 40px, 90px 10px, 150px 120px',
  opacity: 0.55,
}

const corner = (pos: CSSProperties): CSSProperties => ({
  position: 'absolute',
  color: GOLD,
  fontSize: 44,
  lineHeight: 1,
  ...pos,
})

/**
 * Fixed 1080x1350 (4:5) card. Everything is inline-styled with solid colours (no
 * background-clip text, masks or animation) so html-to-image renders it identically everywhere.
 */
export function ShareCard({ wishText, giftType, alias, mine }: ShareCardProps) {
  const gift = getGift(giftType)
  const layout = cardLayout(wishText, gift.name, alias)
  return (
    <div
      style={{
        position: 'relative',
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        overflow: 'hidden',
        boxSizing: 'border-box',
        color: CREAM,
        fontFamily: BODY_FONT,
        background: 'radial-gradient(ellipse at 50% 0%, #5a3f10 0%, #1b130a 42%, #070504 100%)',
      }}
    >
      <div style={GLITTER} />
      <div style={{ position: 'absolute', inset: 36, border: `6px solid ${GOLD}`, borderRadius: 28 }} />
      <div style={{ position: 'absolute', inset: 58, border: '2px solid rgba(245,197,66,0.55)', borderRadius: 18 }} />
      <span style={corner({ top: 72, left: 78 })}>✦</span>
      <span style={corner({ top: 72, right: 78 })}>✦</span>
      <span style={corner({ bottom: 72, left: 78 })}>✦</span>
      <span style={corner({ bottom: 72, right: 78 })}>✦</span>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          padding: '112px 110px 100px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 24, letterSpacing: '0.42em', color: GOLD, textTransform: 'uppercase' }}>✦ Official Notice ✦</div>
        <div style={{ marginTop: 12, fontFamily: TITLE_FONT, fontWeight: 900, fontSize: 40, letterSpacing: '0.12em', color: GOLD_LIGHT }}>
          THE WISHING WELL
        </div>

        <div
          style={{
            marginTop: 34,
            fontFamily: TITLE_FONT,
            fontWeight: 900,
            fontSize: layout.headline,
            lineHeight: 1.08,
            color: GOLD_LIGHT,
            textTransform: 'uppercase',
            textShadow: '0 0 40px rgba(245,197,66,0.55), 0 3px 0 #9a6f0b',
          }}
        >
          {mine ? 'Your wish has been granted!' : 'This wish has been granted!'}
        </div>

        {/* The quote takes whatever height is left; its font steps down as the wish gets longer. */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <div
            style={{
              fontStyle: 'italic',
              fontSize: layout.wish,
              lineHeight: 1.22,
              color: CREAM,
              overflowWrap: 'anywhere',
              maxHeight: '100%',
            }}
          >
            “{wishText.trim()}”
          </div>
        </div>

        <div style={{ fontSize: layout.emoji, lineHeight: 1, filter: 'drop-shadow(0 0 30px rgba(255,227,138,0.55))' }}>{gift.emoji}</div>
        <div style={{ marginTop: 14, fontWeight: 800, fontSize: layout.giftName, lineHeight: 1.12, color: GOLD_LIGHT }}>
          {gift.name}
        </div>

        <div style={{ marginTop: 34, fontSize: 26, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,241,184,0.7)' }}>
          Granted by
        </div>
        <div style={{ marginTop: 8, fontWeight: 800, fontSize: layout.alias, lineHeight: 1.1, color: GOLD }}>{alias}</div>

        <div style={{ marginTop: 40, width: 360, height: 2, background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />
        <div style={{ marginTop: 26, fontSize: 28, color: 'rgba(255,241,184,0.8)', letterSpacing: '0.02em' }}>{FOOTER_TEXT}</div>
      </div>
    </div>
  )
}
