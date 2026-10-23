export interface Wish {
  id: string
  text: string
  wisher_name: string | null
  created_at: string
  /** Derived: number of gifts, from the embedded gifts(count) or realtime events. */
  gift_count: number
}

export interface Gift {
  id: string
  wish_id: string
  gift_type: string
  sender_alias: string
  message: string | null
  created_at: string
}

export interface ReceiptData {
  txnId: string
  /** ISO timestamp printed on the receipt (the gift's created_at). */
  issuedAt: string
  giftName: string
  giftEmoji: string
  items: { name: string; qty: number; price: string }[]
  /** Fixed jokes: "Wish Processing Fee" and GST. */
  fee: string
  gst: string
  extras: { label: string; value: string }[]
  total: string
  tracker: { status: string; done: boolean }[]
  footer: string
}
