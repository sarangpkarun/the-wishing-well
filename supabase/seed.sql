-- Seed data for The Wishing Well: 30 fake wishes, 15 fake gifts.
-- Runs automatically on `supabase db reset`, or paste into the SQL editor.
-- Seeding runs as the postgres role, so RLS doesn't apply. Safe to re-run (fixed ids).
-- Wish n has id 00000000-0000-4000-8000-<n padded to 12 digits>.
-- Timestamps are relative to now(), so the wall always looks freshly active.

insert into public.wishes (id, text, wisher_name, created_at)
select
  ('00000000-0000-4000-8000-' || lpad(v.n::text, 12, '0'))::uuid,
  v.text,
  v.wisher_name,
  now() - (31 - v.n) * interval '47 minutes'
from (values
  (1,  'I want a pizza', 'Hungry Harold'),
  (2,  'I want my ex to see me thriving', 'Thriving Tanya'),
  (3,  'I want a nap that lasts 3 business days', null),
  (4,  'I want my WiFi to work on the first try', 'Router Rahul'),
  (5,  'I want one (1) sock that matches', 'Sockless Sam'),
  (6,  'I want to be the main character, just on Tuesdays', 'Main Character Meera'),
  (7,  'I want a yacht. I get seasick. I still want a yacht.', 'Captain Queasy'),
  (8,  'I want my houseplants to forgive me', 'Fern Murderer'),
  (9,  'I want a meeting that could have been an email to be an email', null),
  (10, 'I want a pet dragon, small, house-trained', 'Dragon Dave'),
  (11, 'I want my phone to stop being at 1% in public', 'Low Battery Lata'),
  (12, 'I want someone to say "no worries" and mean it', null),
  (13, 'I want a private island, preferably with Wi-Fi and no sand', 'Island Ishaan'),
  (14, 'I want one day without a "per my last email"', 'Passive Priya'),
  (15, 'I want my cat to acknowledge me as an equal', 'Servant of Mittens'),
  (16, 'I want a samosa. A fresh one. Is that too much?', 'Samosa Sunil'),
  (17, 'I want to win an argument I had 6 years ago', null),
  (18, 'I want a pigeon that will do my taxes', 'Kevin''s Accountant'),
  (19, 'I want the gym to feel guilty for the membership I''m not using', 'Gymless Gita'),
  (20, 'I want to be mildly famous in a very specific town', 'Local Legend Lalit'),
  (21, 'I want a solid gold toilet seat. Gold-coloured is fine.', 'Throne Seeker'),
  (22, 'I want my alarm clock to apologise', null),
  (23, 'I want a stranger to hold the lift for me, emotionally', 'Elevator Esha'),
  (24, 'I want a better excuse than "my dog ate it". I don''t have a dog.', 'Doggoless Dev'),
  (25, 'I want to rewind to before I opened that group chat', 'Muted Mohit'),
  (26, 'I want a participation trophy for getting out of bed', 'Barely Beatrice'),
  (27, 'I want my mom to stop sending me forwards, then send me one', null),
  (28, 'I want a billionaire to notice me. Any billionaire. Even a small one.', 'Humble Hustler'),
  (29, 'I want a cup of chai that never goes cold', 'Chai Chetan'),
  (30, 'I want literally anything, I just want to open something', 'Gift-Starved Gopal')
) as v(n, text, wisher_name)
on conflict (id) do nothing;

insert into public.gifts (id, wish_id, gift_type, sender_alias, message, created_at)
select
  ('00000000-0000-4000-9000-' || lpad(v.g::text, 12, '0'))::uuid,
  ('00000000-0000-4000-8000-' || lpad(v.wish_n::text, 12, '0'))::uuid,
  v.gift_type,
  v.sender_alias,
  v.message,
  now() - v.mins_ago * interval '1 minute'
from (values
  (1,  1,  'imaginary-pizza',         'Definitely Not Ambani',               'Extra imaginary cheese, on the house.',        1300),
  (2,  2,  'clipart-yacht',           'Totally Not Bezos',                   'Thrive harder. Here is a boat.',               1200),
  (3,  3,  'mild-applause',           'Legally Distinct From Gates',         'Sleep well. Clap clap.',                       1100),
  (4,  5,  'one-sock',                'Cousin of Musk',                      'It matches nothing. That was the wish.',       1000),
  (5,  7,  'clipart-yacht',           'Rumoured Nephew of Buffett',          null,                                           900),
  (6,  10, 'pigeon-kevin',            'Honorary Mr. Monopoly',               'Kevin is not a dragon. Kevin thinks he is.',   800),
  (7,  13, 'private-island-sticker',  'Suspiciously Similar to Adani',       'Peel and stick. No sand, as requested.',       700),
  (8,  15, 'participation-trophy',    'Unrelated to Zuckerberg',             'Mittens has been told. She does not care.',    600),
  (9,  16, 'stale-samosa',            'Definitely Not Ambani',               'Fresh as of 2019.',                            500),
  (10, 18, 'pigeon-kevin',            'Intern at Tata',                      'Reply when he files. He won''t.',              400),
  (11, 21, 'golden-toilet-seat',      'Legally Distinct From Scrooge McDuck', 'Spray-paint is just gold with ambition.',     300),
  (12, 26, 'participation-trophy',    'Totally Not Mittal',                  'You did it! Whatever "it" was.',               200),
  (13, 28, 'monopoly-money',          'Cousin of Rothschild',                'Noticed. Here is $500. Park Place only.',      120),
  (14, 29, 'vintage-air',             'Mr. Ambani''s Accountant''s Dog, Dorsey', 'Warm air from a Tuesday in 2009.',         60),
  (15, 30, 'haunted-pet',      'Honorary Gates',                      'Open it. It has been waiting.',                20)
) as v(g, wish_n, gift_type, sender_alias, message, mins_ago)
on conflict (id) do nothing;
