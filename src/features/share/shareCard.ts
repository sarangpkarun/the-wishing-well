// Feature: shareable wish card. Pure helpers (no React, no network) so they're unit-testable.

export const CARD_WIDTH = 1080
export const CARD_HEIGHT = 1350
export const FOOTER_TEXT = "thewishingwell.lol, not real, please don't send money"

/** Long wishes get smaller type so the card never overflows (wishes are capped at 200 chars). */
export function wishFontSize(text: string): number {
  const n = text.trim().length
  if (n <= 40) return 76
  if (n <= 80) return 66
  if (n <= 130) return 56
  return 46
}

// Content area inside the frame: 1350 - top padding (112) - bottom padding (100).
const CONTENT_HEIGHT = 1138
const TEXT_WIDTH = 860
const MIN_WISH_FONT = 34

export interface CardLayout {
  headline: number
  emoji: number
  wish: number
  giftName: number
  alias: number
}

// Comfortable -> tight. A longer wish / gift name / alias steps down to a later tier.
// `floor` is the smallest the wish may get before we shrink the decoration instead: the wish is
// the point of the card, so ornaments give way first.
const TIERS = [
  { headline: 78, emoji: 210, floor: 56 },
  { headline: 66, emoji: 170, floor: 50 },
  { headline: 56, emoji: 130, floor: 44 },
  { headline: 50, emoji: 110, floor: MIN_WISH_FONT },
]

const lines = (chars: number, fontSize: number, charWidth: number) =>
  Math.max(1, Math.ceil((chars * charWidth * fontSize) / TEXT_WIDTH))

/** Conservative height estimate (wide char-width factors) so the quote is never clipped. */
function estimateHeight(l: CardLayout, wishLen: number, giftNameLen: number, aliasLen: number): number {
  const kickerAndTitle = 90
  const headline = 34 + 2 * l.headline * 1.08
  const quote = lines(wishLen + 2, l.wish, 0.42) * l.wish * 1.22 + 30
  const gift = 14 + lines(giftNameLen, l.giftName, 0.55) * l.giftName * 1.12
  const sender = 34 + 32 + 8 + lines(aliasLen, l.alias, 0.55) * l.alias * 1.1
  const footer = 102
  return kickerAndTitle + headline + quote + l.emoji + gift + sender + footer
}

/** Picks the largest type sizes at which everything fits inside the card. */
export function cardLayout(wishText: string, giftName: string, alias: string): CardLayout {
  const wishLen = wishText.trim().length
  const giftFont = giftName.length > 34 ? 40 : 52
  const aliasFont = alias.length > 28 ? 46 : 58
  const baseWish = wishFontSize(wishText)
  let last: CardLayout | null = null
  for (const t of TIERS) {
    for (let wish = baseWish; wish >= Math.min(baseWish, t.floor); wish -= 4) {
      last = { headline: t.headline, emoji: t.emoji, wish, giftName: giftFont, alias: aliasFont }
      if (estimateHeight(last, wishLen, giftName.length, alias.length) <= CONTENT_HEIGHT) return last
    }
  }
  return last!
}

export const estimatedHeight = (l: CardLayout, wishText: string, giftName: string, alias: string) =>
  estimateHeight(l, wishText.trim().length, giftName.length, alias.length)
export const CARD_CONTENT_HEIGHT = CONTENT_HEIGHT

export const shareFilename = (giftId: string): string => `wishing-well-card-${giftId.slice(0, 8)}.png`

export const SHARE_TITLE = 'My wish was granted!'
export const SHARE_TEXT = 'My wish was granted (nothing was delivered). thewishingwell.lol'
