import { getGift } from '../config/giftCatalog'
import {
  EXTRA_CHARGES,
  FOOTERS,
  TOTALS,
  TRACKER_EARLY,
  TRACKER_FINAL_BY_GIFT,
  TRACKER_FINAL_GENERIC,
} from '../config/receiptJokes'
import type { Gift, ReceiptData } from '../types'
import { hashString, pick, pickMany, seededRng, type Rng } from './random'

// No 0/O/1/I so a transaction ID can be read out loud to a (fictional) support agent.
const TXN_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function buildReceipt(giftId: string, rng: Rng = Math.random, issuedAt = new Date().toISOString()): ReceiptData {
  const gift = getGift(giftId)
  const txnId = `TXN-${Array.from({ length: 12 }, () => TXN_CHARS[Math.floor(rng() * TXN_CHARS.length)]).join('')}`
  return {
    txnId,
    issuedAt,
    giftName: gift.name,
    giftEmoji: gift.emoji,
    items: [{ name: gift.name, qty: 1, price: gift.price }],
    fee: '₹0.00',
    gst: '18% (emotional)',
    extras: pickMany(EXTRA_CHARGES, 1, rng),
    total: pick(TOTALS, rng),
    tracker: [
      ...pickMany(TRACKER_EARLY, 2, rng).map((status) => ({ status, done: true })),
      { status: TRACKER_FINAL_BY_GIFT[gift.id] ?? pick(TRACKER_FINAL_GENERIC, rng), done: false },
    ],
    footer: pick(FOOTERS, rng),
  }
}

/** Receipts aren't stored; the same gift always yields the same jokes and transaction ID. */
export const receiptForGift = (gift: Pick<Gift, 'id' | 'gift_type' | 'created_at'>): ReceiptData =>
  buildReceipt(gift.gift_type, seededRng(hashString(gift.id)), gift.created_at)
