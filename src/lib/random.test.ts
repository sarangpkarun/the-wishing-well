import { describe, expect, it } from 'vitest'
import { generateAlias } from './alias'
import { buildReceipt, receiptForGift } from './receipt'
import { seededRng } from './random'

describe('generators', () => {
  it('alias is deterministic for a seed and non-empty', () => {
    const a = generateAlias(seededRng(42))
    const b = generateAlias(seededRng(42))
    expect(a).toBe(b)
    expect(a.length).toBeGreaterThan(5)
    expect(a.length).toBeLessThanOrEqual(60)
  })

  it('receipt has item, fee, gst, txn id, total and a tracker ending on an undelivered step', () => {
    const r = buildReceipt('pigeon-kevin', seededRng(7), '2026-01-01T00:00:00Z')
    expect(r.items).toEqual([{ name: 'A Pigeon Named Kevin', qty: 1, price: expect.any(String) }])
    expect(r.fee).toBe('₹0.00')
    expect(r.gst).toBe('18% (emotional)')
    expect(r.txnId).toMatch(/^TXN-[A-Z2-9]{12}$/)
    expect(r.total).toBeTruthy()
    expect(r.tracker).toHaveLength(3)
    expect(r.tracker.map((t) => t.done)).toEqual([true, true, false])
    expect(r.tracker[2].status).toBe('Your pigeon is out for delivery. It is lost.')
  })

  it('same gift always produces the same receipt', () => {
    const g = { id: 'abc', gift_type: 'stale-samosa', created_at: '2026-01-01T00:00:00Z' }
    expect(receiptForGift(g)).toEqual(receiptForGift(g))
    expect(receiptForGift({ ...g, id: 'abd' }).txnId).not.toBe(receiptForGift(g).txnId)
  })

  it('unknown gift key falls back to mystery item', () => {
    expect(buildReceipt('nope', seededRng(1)).giftName).toBe('Mystery Item')
  })
})
