// Static gift catalog. The database only stores `id` (gifts.gift_type), so ids must stay
// lowercase letters/digits/dashes (see the CHECK constraint in supabase/migrations/0001_init.sql)
// and should never be renamed once gifts exist. No real brands or real people in here.

export type Rarity = 'common' | 'rare' | 'legendary'

export interface CatalogGift {
  id: string
  name: string
  emoji: string
  /** Fake price shown on the picker and the receipt. */
  price: string
  /** One-line joke. */
  description: string
  rarity: Rarity
  /** Shown on the reveal screen after the box opens. */
  revealLine: string
}

export const GIFT_CATALOG: CatalogGift[] = [
  {
    id: 'stale-samosa',
    name: 'Slightly Stale Samosa',
    emoji: '🥟',
    price: '₹20 (₹0 if you count the guilt)',
    description: 'Crispy on the outside, regret on the inside.',
    rarity: 'common',
    revealLine: 'It was warm once. Probably.',
  },
  {
    id: 'pigeon-kevin',
    name: 'A Pigeon Named Kevin',
    emoji: '🐦',
    price: '2 breadcrumbs and 1 existential crisis',
    description: 'Kevin has opinions. Kevin has already left.',
    rarity: 'rare',
    revealLine: 'Kevin flew off with the receipt.',
  },
  {
    id: 'pigeon-gerald',
    name: 'Gerald, a Pigeon Who Has Seen Things',
    emoji: '🐦',
    price: '1 crust of bread and a long stare',
    description: 'Gerald does not talk about what he saw.',
    rarity: 'rare',
    revealLine: 'Gerald nodded once and left. He knows.',
  },
  {
    id: 'pigeon-kevin-cousin',
    name: "Kevin's Cousin, Also Named Kevin",
    emoji: '🕊️',
    price: '2 breadcrumbs (family discount)',
    description: 'Does not know where Kevin is either.',
    rarity: 'rare',
    revealLine: 'Two Kevins. Zero deliveries.',
  },
  {
    id: 'broke-certificate',
    name: '"Sorry I\'m Broke But I Believe in You" Certificate',
    emoji: '📜',
    price: '₹0 (framing not included)',
    description: 'Signed in imaginary ink. Legally worthless, emotionally rich.',
    rarity: 'common',
    revealLine: 'Suitable for framing, fridge-magnetting, or ignoring.',
  },
  {
    id: 'clipart-yacht',
    name: 'Yacht (Clip-Art JPEG)',
    emoji: '🛥️',
    price: '₹4,00,00,000 at 72 dpi',
    description: 'Heavily compressed luxury. Please do not zoom in.',
    rarity: 'legendary',
    revealLine: 'Resolution: 240p. Vibes: 4K.',
  },
  {
    id: 'deleted-ex',
    name: "Deleted Your Ex's Number for You",
    emoji: '📵',
    price: 'Priceless (already deleted, no refunds)',
    description: "You're welcome. It was saved as \"DO NOT\".",
    rarity: 'rare',
    revealLine: 'Gone. Along with 14 unsent drafts. Healing!',
  },
  {
    id: 'good-vibes',
    name: 'Good Vibes (Non-Refundable)',
    emoji: '✨',
    price: '₹0, all sales final',
    description: 'Delivered instantly. Cannot be returned, exchanged or explained.',
    rarity: 'common',
    revealLine: 'Vibes have been deposited. Do not ask for a receipt. (Here is a receipt.)',
  },
  {
    id: 'monopoly-money',
    name: 'Briefcase of Monopoly Money',
    emoji: '💼',
    price: '₹1,00,00,000 in Monopoly money',
    description: 'Accepted on Boardwalk and absolutely nowhere else.',
    rarity: 'rare',
    revealLine: 'Do not pass Go. Do not deposit at bank.',
  },
  {
    id: 'one-sock',
    name: 'One (1) Sock',
    emoji: '🧦',
    price: '0.5 socks',
    description: 'Its pair is in a better place. The dryer.',
    rarity: 'common',
    revealLine: 'It matches nothing. That was the wish.',
  },
  {
    id: 'participation-trophy',
    name: 'Participation Trophy',
    emoji: '🏆',
    price: '1st place in attendance',
    description: 'For showing up. Barely.',
    rarity: 'common',
    revealLine: 'You did it! Whatever "it" was.',
  },
  {
    id: 'imaginary-pizza',
    name: 'Imaginary Pizza',
    emoji: '🍕',
    price: '12 slices of nothing',
    description: 'Zero calories, zero cheese, zero pizza.',
    rarity: 'common',
    revealLine: 'Extra cheese is also imaginary.',
  },
  {
    id: 'vintage-air',
    name: 'Jar of Vintage Air',
    emoji: '🫙',
    price: '₹999 (collector\'s edition)',
    description: 'Harvested from a very average Tuesday in 2009.',
    rarity: 'rare',
    revealLine: 'Breathe responsibly.',
  },
  {
    id: 'mild-applause',
    name: 'Round of Mild Applause',
    emoji: '👏',
    price: '7 claps (3 enthusiastic)',
    description: 'Slightly more than polite.',
    rarity: 'common',
    revealLine: 'Someone in the back is clapping sarcastically.',
  },
  {
    id: 'haunted-pet',
    name: 'Haunted Digital Pet',
    emoji: '👻',
    price: '3 souls, gently used',
    description: 'It has never once been fed. It remembers.',
    rarity: 'rare',
    revealLine: 'It is staring at you. Pixelated, but still.',
  },
  {
    id: 'private-island-sticker',
    name: 'Private Island (Sticker)',
    emoji: '🏝️',
    price: '1 island, laminated',
    description: 'Peel, stick, and own a landmass.',
    rarity: 'legendary',
    revealLine: 'Deed not included. Sand not included. Island very included.',
  },
  {
    id: 'golden-toilet-seat',
    name: 'Solid Gold Toilet Seat (Gold-Coloured)',
    emoji: '🚽',
    price: '₹49 (spray paint)',
    description: 'Throne-adjacent. Not rated for royalty.',
    rarity: 'legendary',
    revealLine: 'Seat not rated for royalty.',
  },
  {
    id: 'cold-chai',
    name: 'Emotional Support Chai (Cold)',
    emoji: '☕',
    price: '₹10 (reheating costs extra)',
    description: 'It was hot when I thought of you.',
    rarity: 'common',
    revealLine: 'Skin on top included at no extra charge.',
  },
  {
    id: 'cardboard-car',
    name: 'Cardboard Sports Car',
    emoji: '🏎️',
    price: '₹80,00,000 (waterproofing sold separately)',
    description: '0 to 60 in however long you can push it.',
    rarity: 'rare',
    revealLine: 'Do not drive in the rain. Or at all.',
  },
  {
    id: 'awkward-hug',
    name: 'Coupon for One (1) Awkward Hug',
    emoji: '🤗',
    price: 'Expires the moment it gets weird',
    description: 'Redeemable at any family function.',
    rarity: 'common',
    revealLine: 'Side-hug only. Back pat optional.',
  },
]

const BY_ID = new Map(GIFT_CATALOG.map((g) => [g.id, g]))

export const MYSTERY_GIFT: CatalogGift = {
  id: 'mystery',
  name: 'Mystery Item',
  emoji: '🎁',
  price: '???',
  description: 'Nobody knows. Not even us.',
  rarity: 'common',
  revealLine: 'The box is empty. The thought was there.',
}

export const getGift = (id: string): CatalogGift => BY_ID.get(id) ?? MYSTERY_GIFT
