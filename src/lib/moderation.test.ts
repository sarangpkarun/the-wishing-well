import { describe, expect, it } from 'vitest'
import { checkText, containsEmail, containsPhoneNumber, containsProfanity } from './moderation'

describe('checkText', () => {
  it.each(['I want a pizza', 'I want my ex to see me thriving', 'I want 1000 samosas', 'class assignment', 'I want to visit Scunthorpe'])(
    'allows %s',
    (t) => expect(checkText(t, 3, 200)).toBeNull(),
  )

  it('enforces length', () => {
    expect(checkText('hi', 3, 200)).toMatch(/at least 3/)
    expect(checkText('a'.repeat(201), 3, 200)).toMatch(/under 200/)
  })
})

describe('emails', () => {
  it.each(['mail me at bob@example.com', 'bob @ example.com', 'bob (at) example.com', 'bob[at]gmail', 'bob at gmail dot com'])(
    'blocks %s',
    (t) => expect(containsEmail(t)).toBe(true),
  )
  it('does not block normal "at"', () => expect(containsEmail('I want to be at the beach')).toBe(false))
})

describe('phone numbers', () => {
  it.each(['call 9876543210', '+91 98765 43210', '(555) 123-4567', '555.123.4567', '9 8 7 6 5 4 3 2 1 0'])(
    'blocks %s',
    (t) => expect(containsPhoneNumber(t)).toBe(true),
  )
  it.each(['I want 1000000 rupees', 'room 404 at 5:30', 'Born in 1999, still waiting'])('allows %s', (t) =>
    expect(containsPhoneNumber(t)).toBe(false),
  )
})

describe('profanity', () => {
  it.each(['what the fuck', 'sh1t', 'f u c k'.replace(/ /g, ''), 'fuuuuck this', 'You BITCH', 'bullshit', 'shits', 'what the shit!', 'sh!t'.replace('!', 'i')])(
    'blocks %s',
    (t) => expect(containsProfanity(t)).toBe(true),
  )
  it.each(['classic', 'assist me', 'Scunthorpe', 'cocktail', 'I want a shiitake pizza', 'dickens novel'])('allows %s', (t) =>
    expect(containsProfanity(t)).toBe(false),
  )
})
