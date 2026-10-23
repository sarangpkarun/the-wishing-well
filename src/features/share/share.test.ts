import { describe, expect, it, vi } from 'vitest'
import { GIFT_CATALOG } from '../../config/giftCatalog'
import { CARD_CONTENT_HEIGHT, CARD_HEIGHT, CARD_WIDTH, FOOTER_TEXT, cardLayout, estimatedHeight, shareFilename, wishFontSize } from './shareCard'
import { shareOrDownload } from './shareImage'

describe('card constants', () => {
  it('is 1080x1350 (4:5) with the required footer', () => {
    expect([CARD_WIDTH, CARD_HEIGHT]).toEqual([1080, 1350])
    expect(FOOTER_TEXT).toBe("thewishingwell.lol, not real, please don't send money")
  })

  it('shrinks the wish type as it gets longer, never growing', () => {
    const sizes = [10, 40, 41, 80, 81, 130, 131, 200].map((n) => wishFontSize('x'.repeat(n)))
    for (let i = 1; i < sizes.length; i++) expect(sizes[i]).toBeLessThanOrEqual(sizes[i - 1])
    expect(sizes[0]).toBeGreaterThan(sizes[sizes.length - 1])
  })

  it('names the file after the gift', () => {
    expect(shareFilename('abcdef12-3456')).toBe('wishing-well-card-abcdef12.png')
  })
})

describe('card layout', () => {
  const longestGift = GIFT_CATALOG.reduce((a, g) => (g.name.length > a.length ? g.name : a), '')
  const aliases = ['Dr. Ka-Ching', 'Sir Moneybags the 3rd', "Mr. Ambani's Accountant's Dog, Jack Dorsey", 'x'.repeat(60)]

  it('always fits: any wish length, any gift, any alias', () => {
    const gifts = ['Pigeon', longestGift, 'x'.repeat(60)]
    for (let len = 1; len <= 200; len += 3)
      for (const g of gifts)
        for (const a of aliases) {
          const text = 'word '.repeat(Math.ceil(len / 5)).slice(0, len)
          const l = cardLayout(text, g, a)
          expect(estimatedHeight(l, text, g, a)).toBeLessThanOrEqual(CARD_CONTENT_HEIGHT)
        }
  })

  it('stays comfortable for short, typical cards', () => {
    const l = cardLayout('I want a pizza', 'Imaginary Pizza', 'Sir Moneybags the 3rd')
    expect(l.headline).toBe(78)
    expect(l.emoji).toBe(210)
  })

  it('never makes the wish bigger than its natural size', () => {
    for (let len = 1; len <= 200; len += 7) {
      const text = 'word '.repeat(Math.ceil(len / 5)).slice(0, len)
      expect(cardLayout(text, longestGift, aliases[2]).wish).toBeLessThanOrEqual(wishFontSize(text))
    }
  })

  it('shrinks other elements to keep a long wish readable', () => {
    const long = 'x '.repeat(100)
    const l = cardLayout(long, longestGift, aliases[2])
    expect(l.emoji).toBeLessThan(210)
    expect(l.wish).toBeGreaterThanOrEqual(34)
  })
})

describe('shareOrDownload', () => {
  const blob = new Blob(['x'], { type: 'image/png' })
  const opts = { title: 't', text: 'x' }

  it('shares the file when the browser can', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    const download = vi.fn()
    const out = await shareOrDownload(blob, 'a.png', { ...opts, nav: { canShare: () => true, share }, download })
    expect(out).toBe('shared')
    expect(share.mock.calls[0][0].files[0].name).toBe('a.png')
    expect(download).not.toHaveBeenCalled()
  })

  it('downloads when file sharing is unsupported', async () => {
    const download = vi.fn()
    expect(await shareOrDownload(blob, 'a.png', { ...opts, nav: {}, download })).toBe('downloaded')
    expect(await shareOrDownload(blob, 'a.png', { ...opts, nav: { share: vi.fn(), canShare: () => false }, download })).toBe('downloaded')
    expect(download).toHaveBeenCalledTimes(2)
  })

  it('treats closing the share sheet as cancel, not failure', async () => {
    const download = vi.fn()
    const share = vi.fn().mockRejectedValue(Object.assign(new Error('x'), { name: 'AbortError' }))
    expect(await shareOrDownload(blob, 'a.png', { ...opts, nav: { canShare: () => true, share }, download })).toBe('cancelled')
    expect(download).not.toHaveBeenCalled()
  })

  it('falls back to download when sharing fails for any other reason', async () => {
    const download = vi.fn()
    const share = vi.fn().mockRejectedValue(Object.assign(new Error('x'), { name: 'NotAllowedError' }))
    expect(await shareOrDownload(blob, 'a.png', { ...opts, nav: { canShare: () => true, share }, download })).toBe('downloaded')
    expect(download).toHaveBeenCalledOnce()
  })
})
