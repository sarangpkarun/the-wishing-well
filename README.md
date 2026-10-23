# The Wishing Well

A joke site. People post wishes ("I want a pizza", "I want my ex to see me thriving") and strangers
"grant" them with ridiculous virtual gifts (a slightly stale samosa, a pigeon named Kevin, a clip-art
yacht) under fake billionaire aliases like *Sir Moneybags the 3rd* or *Definitely Not Ambani*.
The wisher gets a confetti reveal and a fake receipt ("Tax: Emotional").

**Nothing here is real. No money, no gifts, no accounts.**

**Stack:** Vite · React 19 · TypeScript · Tailwind 3 · Framer Motion · React Router · Supabase (Postgres + Realtime, anon key only) · Vercel.

## Features

- Wish wall with realtime updates, "make a wish" modal, and a client-side filter (phone numbers, emails, links, profanity)
- Grant a wish: 20 gifts, random fake-billionaire alias (sticks to your browser), optional anonymous message
- Reveal: confetti, optional synthesised "angelic choir" (muted by default), screenshot-friendly fake receipt with delivery tracker
- Share: 1080×1350 gold wish card via the Web Share API, falling back to a PNG download
- Extras, each isolated in `src/features/<name>/`: Wish Denied stamp, Random Genie, leaderboards, wealth meter and Rich List, pigeon lofts
- Report button on every wish, plus rate limiting in the browser **and** the database

## Quick start

You need Node 20+ and a free [Supabase](https://supabase.com) project.

1. **Create a Supabase project.** No auth setup needed; the app only uses the public anon key.
2. **Run the migrations**, in order, in the Supabase SQL editor (or `supabase db push` with the CLI):

   | File | What it does |
   |---|---|
   | `supabase/migrations/0001_init.sql` | `wishes` and `gifts` tables, row level security, realtime |
   | `supabase/migrations/0002_alias_stats.sql` | `alias_stats` view (leaderboard, wealth meter) |
   | `supabase/migrations/0003_leaderboards.sql` | `wish_stats` and `wisher_stats` views |
   | `supabase/migrations/0004_reports_and_rate_limits.sql` | `reports` table and database rate limits |

   **Before running 0004, change the `salt` constant** in `enforce_rate_limit()` to your own random string
   (it's only used to hash IP addresses before they're counted).
3. *(Optional)* Run `supabase/seed.sql` for 30 sample wishes and 15 gifts. Safe to re-run.
4. **Configure env vars:** `cp .env.example .env` and fill in the two Supabase values (see below).
5. `npm install && npm run dev`, then open http://localhost:5173.

Without a `.env` the landing page and 404 still work; other pages show a setup notice.

## Environment variables

| Variable | Required | Where to find it |
|---|---|---|
| `VITE_SUPABASE_URL` | yes | Supabase → Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | yes | Supabase → Project Settings → API → `anon` `public` key |
| `VITE_SITE_URL` | no | Your public URL, used to build the absolute Open Graph image link. Defaults to Vercel's production domain, else `https://thewishingwell.lol` |

The anon key is **meant** to be public (it ships in the browser bundle). Row level security is what protects
the data. Never put the `service_role` key in this app.

## Scripts

| Command | |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Typecheck and production build to `dist/` |
| `npm run typecheck` | `tsc -b` |
| `npm run lint` | oxlint |
| `npm test` | Vitest unit tests |
| `npm run check` | Typecheck, lint and tests in one go |

## Deploy to Vercel

1. Push this repo to GitHub, GitLab or Bitbucket.
2. In Vercel: **Add New → Project**, import the repo. Vercel detects Vite; the defaults are right
   (build `npm run build`, output `dist`).
3. Under **Environment Variables** add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
   (and `VITE_SITE_URL` if you use a custom domain). Apply them to Production and Preview.
4. **Deploy.** `vercel.json` rewrites every path to `index.html`, so deep links like `/wish/...` work.
5. *(Custom domain)* Project → Settings → Domains. Set `VITE_SITE_URL` to it and redeploy so share previews
   point at the right image.
6. Check it: open a wish page in two browsers, post in one, watch it appear in the other (realtime).
   If it doesn't, confirm `wishes` and `gifts` are enabled under Database → Replication.

Env vars are baked in at build time, so **redeploy after changing them**.

## Moderation and abuse

- **Reports** go to the `reports` table. The API can insert but never read them. Review them in the SQL editor:

  ```sql
  select w.id, w.text, w.wisher_name, count(*) as reports,
         array_agg(distinct r.reason) as reasons, max(r.created_at) as latest
  from public.reports r join public.wishes w on w.id = r.wish_id
  group by w.id order by reports desc, latest desc;

  delete from public.wishes where id = '...';   -- removes the wish; its gifts and reports cascade
  ```
- **Rate limits** (rolling hour), enforced in the database so scripts hitting the REST API are covered too:

  | Action | Per session | Per IP |
  |---|---|---|
  | Wishes | 5 | 15 |
  | Gifts | 30 | 90 |
  | Reports | 20 | 60 |

  The browser sends a random `x-session-id` header; the IP comes from `x-forwarded-for` and is stored only as a
  salted hash in `rate_limit_log`, which the API can't read. The same limits are checked in the browser first
  (`src/lib/rateLimit.ts`) for instant, friendly feedback. Keep the two in step if you change them.
- **Honest limits:** a script can mint endless session ids, so the IP limit is the real backstop, and people
  sharing a network share it. If you get serious abuse, add a captcha or put the API behind an edge rate limiter
  (Vercel Firewall, Cloudflare).
- The client-side text filter (`src/lib/moderation.ts`) is a courtesy, not security.

## Before you launch

- Change the `salt` in migration 0004.
- If your domain isn't `thewishingwell.lol`, update the footer on the share card (`FOOTER_TEXT` in
  `src/features/share/shareCard.ts`) and regenerate `public/og-image.png`, which also prints it.
- Decide how you'll review reports. Nothing is hidden automatically.

## Project layout

```
src/
  config/        gift catalog, alias parts, receipt jokes (edit these to change the humour)
  lib/           api, supabase client, rate limiting, moderation, receipts, aliases
  components/    shared UI (layout, modal, wish card, gift grid, receipt, reveal)
  pages/         landing, wall, wish, reveal, my wishes, 404
  features/      denied/ genie/ leaderboards/ wealth/ pigeons/ share/ reports/  (each self-contained)
supabase/
  migrations/    SQL, run in order
  seed.sql       sample data
public/          favicon, app icons, manifest, og-image.png
```

## Notes

- **No accounts.** "My wishes" and "opened gifts" live in this browser's `localStorage`; clearing site data forgets them.
- **Receipts aren't stored.** They're generated from the gift's id, so the same gift always shows the same jokes.
- **The Wish Denied stamp** is derived from the wish id (about 10% of wishes). The "stamp it yourself" button is local to your browser.
- The choir is synthesised in the browser (Web Audio), so there's no audio file to license.
- To add a gift, add an entry to `src/config/giftCatalog.ts`. Ids must be lowercase letters, digits and dashes,
  and should never be renamed once gifts exist.
