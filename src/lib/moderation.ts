// Client-side filter. Friendly guard rails, not a security boundary: the database
// enforces lengths, and anyone with the anon key can bypass the browser entirely.

const MIN_PHONE_DIGITS = 10

const LINK_RE = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|in|co|xyz|ly|me)\b)/i

// name@host.tld, plus the usual dodges: "name (at) host", "name [at] host", "name at host dot com"
const EMAIL_RES = [
  /[^\s@]+\s*@\s*[^\s@]+\.[a-z]{2,}/i,
  /[a-z0-9._%+-]+\s*[([{]\s*at\s*[)\]}]\s*[a-z0-9-]+/i,
  /[a-z0-9._%+-]+\s+at\s+[a-z0-9-]+\s+(dot|\.)\s*[a-z]{2,}/i,
]

// A run of digits (optionally split by spaces, dots, dashes, parens, +) that adds up to a phone number.
const PHONE_RUN_RE = /\+?\d(?:[\s().-]*\d)+/g

// Basic list; matched on word boundaries so "class" and "Scunthorpe" survive.
const PROFANITY = [
  'fuck', 'fucker', 'motherfucker', 'shit', 'bullshit', 'bitch', 'asshole', 'bastard',
  'dick', 'dickhead', 'cunt', 'pussy', 'slut', 'whore', 'cock', 'twat', 'wanker',
  'bollocks', 'nigger', 'nigga', 'faggot', 'retard', 'rape', 'kys',
  // a few common Hindi/Hinglish ones
  'chutiya', 'madarchod', 'behenchod', 'bhenchod', 'bhosdike', 'gandu', 'harami', 'randi', 'lund',
]
const PROFANITY_RE = new RegExp(`\\b(?:${PROFANITY.join('|')})(?:s|es|ed|ing|er|ers|y)?\\b`)

const LEET: Record<string, string> = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', $: 's' }

/** Lowercase, undo leetspeak ("sh1t"), and squash letter stretching ("fuuuck"). */
function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/[013457@$]/g, (c) => LEET[c] ?? c)
    .replace(/[*_.\-']+(?=\p{L})/gu, '') // f.u.c.k / f*ck -> fck-ish; letters stay
    .replace(/(\p{L})\1{2,}/gu, '$1$1')
}

export const containsEmail = (text: string): boolean => EMAIL_RES.some((re) => re.test(text))

export function containsPhoneNumber(text: string): boolean {
  return (text.match(PHONE_RUN_RE) ?? []).some((run) => run.replace(/\D/g, '').length >= MIN_PHONE_DIGITS)
}

export function containsProfanity(text: string): boolean {
  const n = normalise(text)
  // normalise() squashes stretching to double letters ("fuuuck" -> "fuuck"); also try singles to catch it.
  return PROFANITY_RE.test(n) || PROFANITY_RE.test(n.replace(/(\p{L})\1/gu, '$1'))
}

/** Returns a user-facing problem, or null if the text is fine. */
export function checkText(text: string, min: number, max: number): string | null {
  const t = text.trim()
  if (t.length < min) return min === 1 ? 'Say something!' : `Needs at least ${min} characters.`
  if (t.length > max) return `Keep it under ${max} characters.`
  if (containsEmail(t)) return 'No email addresses, please. The well does not do newsletters.'
  if (containsPhoneNumber(t)) return 'No phone numbers, please. The well is not a dating app.'
  if (LINK_RE.test(t)) return 'No links, please. The well is not a billboard.'
  if (containsProfanity(t)) return 'Whoa, keep it classy. The well has delicate ears.'
  return null
}
