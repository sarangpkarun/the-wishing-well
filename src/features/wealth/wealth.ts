// Feature: wealth meter. Every gift an alias sends makes it richer, in numbers that make no sense.
// Pure and deterministic: the same (alias, gift count) always shows the same net worth.
import { hashString } from '../../lib/random'

// Orders of magnitude, getting sillier. "Level" = number of gifts, capped at the top of the ladder.
const LADDER = ['', 'thousand', 'lakh', 'crore', 'arab', 'kharab', 'zillion', 'gazillion', 'bazillion', 'Kevin-illion']

const UNITS = [
  'Monopoly rupees',
  'imaginary dollars',
  'stale samosas',
  'Kevins',
  'vibes',
  'participation trophies',
  'pigeon-hours',
  'non-refundable good vibes',
]

const SIDE_NOTES: ((n: number) => string)[] = [
  (n) => `minus ${n} feelings`,
  (n) => `plus ${n} unread emails`,
  (n) => `${n}% of a yacht (JPEG)`,
  (n) => `${n}.5 socks`,
  (n) => `owes ${n} Tuesdays`,
  (n) => `${n} regrets, tax-deductible`,
  () => 'plus one (1) Gary',
  (n) => `${n} pigeons, location unknown`,
]

const TIERS: { from: number; name: string }[] = [
  { from: 0, name: 'Broke (Rumoured Otherwise)' },
  { from: 1, name: 'Pocket Change Baron' },
  { from: 2, name: 'Minor Monopoly Mogul' },
  { from: 4, name: 'Comfortably Imaginary' },
  { from: 7, name: 'Yacht-JPEG Magnate' },
  { from: 12, name: 'Lord of the Lost Pigeons' },
  { from: 20, name: 'Dragon on a Pile of Monopoly Money' },
]

export interface NetWorth {
  /** Gauge fill, 0..1. Strictly increases with every gift and never quite reaches 1. */
  fill: number
  amount: string
  tier: string
  sideNote: string
  /** Magnitude step (index into the ladder); useful for tests and styling. */
  level: number
}

export function netWorth(alias: string, gifts: number): NetWorth {
  const n = Math.max(0, Math.floor(gifts))
  const h = hashString(alias)
  const tier = [...TIERS].reverse().find((t) => n >= t.from)!.name
  const sideNote = SIDE_NOTES[hashString(`${alias}:${n}`) % SIDE_NOTES.length]((hashString(`${n}:${alias}`) % 97) + 3)

  if (n === 0) return { fill: 0, amount: '₹0 (rumoured)', tier, sideNote, level: 0 }

  const level = Math.min(n, LADDER.length - 1)
  const mantissa = (((h >>> 3) + n * 7919) % 900) + 100 // 100..999, jumpy on purpose
  const unit = UNITS[h % UNITS.length]
  const extraZeros = n - (LADDER.length - 1)
  const amount =
    `₹${(mantissa / 100).toFixed(2)} ${LADDER[level]} ${unit}` + (extraZeros > 0 ? ` (+${extraZeros} more zeros)` : '')

  return { fill: 1 - Math.exp(-n / 6), amount, tier, sideNote, level }
}
