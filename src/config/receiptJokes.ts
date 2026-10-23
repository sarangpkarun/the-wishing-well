export interface TaxLine {
  label: string
  value: string
}

export const TAX_LINES: TaxLine[] = [
  { label: 'Tax', value: 'Emotional' },
  { label: 'GST (Gift Sentiment Tax)', value: '18% of a hug' },
  { label: 'Service Charge', value: 'One awkward smile' },
  { label: 'Delivery', value: 'Imaginary' },
  { label: 'Handling', value: 'Mishandled' },
  { label: 'Import Duty', value: '2 vibes' },
  { label: 'Gift Wrap', value: 'Thoughts & prayers' },
  { label: 'Convenience Fee', value: 'Inconvenient' },
  { label: 'Insurance', value: 'Lol' },
  { label: 'Karma Surcharge', value: 'Pending' },
  { label: 'Platform Fee', value: 'Your attention' },
]

export const TOTALS = [
  'Priceless*',
  '₹0.00 + feelings',
  'One (1) smile',
  'Roughly a vibe',
  'Your undying gratitude',
  'Ask your therapist',
]

export const FOOTERS = [
  '*Not legally a gift.',
  'No refunds. No returns. No Kevin.',
  'Thank you for believing in nothing.',
  'This receipt is valid in the metaverse only.',
  'Please do not call the number on this receipt. There is no number.',
  'Terms and conditions: vibes.',
  'Item may contain traces of imagination.',
]

/** Extra silly surcharges (one is picked per receipt). The real fee and GST lines are fixed. */
export const EXTRA_CHARGES: TaxLine[] = TAX_LINES.filter((l) => l.label !== 'Tax' && !l.label.startsWith('GST'))

// Delivery tracker: two early steps are picked at random, then a gift-specific (or generic) final status.
export const TRACKER_EARLY = [
  'Wish received and nodded at solemnly',
  'Wish forwarded to a man named Gary',
  'Gift packed in imaginary bubble wrap',
  'Billionaire alias verified (not really)',
  'Gift blessed by a committee of pigeons',
  'Customs asked "is this real?" Answer: no. Cleared.',
  'Courier assigned (courier has not been told)',
]

export const TRACKER_FINAL_GENERIC = [
  'Out for delivery. Driver is "vibing" somewhere.',
  'Delivery attempted. You were not imaginary enough.',
  'Package is in transit through a dimension we do not have maps for.',
  'Stuck at the sorting office, which is a Tuesday.',
]

/** Keyed by catalog gift id. */
export const TRACKER_FINAL_BY_GIFT: Record<string, string> = {
  'pigeon-kevin': 'Your pigeon is out for delivery. It is lost.',
  'pigeon-gerald': 'Gerald is out for delivery. He took a detour to stare at a wall.',
  'pigeon-kevin-cousin': 'Cousin Kevin is out for delivery. He thinks you are the other Kevin.',
  'stale-samosa': 'Samosa is out for delivery. It has gotten staler en route.',
  'clipart-yacht': 'Yacht is out for delivery. It is 240p and stuck in a loading bar.',
  'deleted-ex': 'Number deleted. Ex has been notified by the universe (not really).',
  'good-vibes': 'Vibes dispatched. Currently buffering at 99%.',
  'broke-certificate': 'Certificate is out for delivery. The courier is also broke, but believes in you.',
  'monopoly-money': 'Briefcase held at customs. Officer says "this is a board game".',
  'cardboard-car': 'Car is out for delivery. It started raining. Car is now a puddle.',
  'cold-chai': 'Chai is out for delivery. It has reached room temperature of regret.',
  'awkward-hug': 'Hug is out for delivery. Courier offered a side-hug and left.',
  'haunted-pet': 'Pet is out for delivery. It arrived before the courier left.',
  'private-island-sticker': 'Island is out for delivery. It keeps peeling off the van.',
  'golden-toilet-seat': 'Seat is out for delivery. Courier is sitting on it. Do not ask.',
}
