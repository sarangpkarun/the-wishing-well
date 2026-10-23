-- The Wishing Well: minimal public schema.
--
-- Model: a fully open guestbook. Anyone (anon or anonymous-signed-in) can READ and INSERT.
-- Nobody can UPDATE or DELETE through the API. Cleanup is done by an admin in the
-- Supabase dashboard / SQL editor (the postgres role bypasses RLS).

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.wishes (
  id           uuid primary key default gen_random_uuid(),
  text         text not null
               check (char_length(btrim(text)) between 1 and 200),
  wisher_name  text
               check (wisher_name is null or char_length(btrim(wisher_name)) between 1 and 40),
  created_at   timestamptz not null default now()
);

create table public.gifts (
  id            uuid primary key default gen_random_uuid(),
  wish_id       uuid not null references public.wishes (id) on delete cascade,
  gift_type     text not null
                check (gift_type ~ '^[a-z0-9-]{1,64}$'),          -- key from src/config/giftCatalog.ts
  sender_alias  text not null
                check (char_length(btrim(sender_alias)) between 1 and 60),
  message       text
                check (message is null or char_length(message) <= 140),
  created_at    timestamptz not null default now()
);

-- The wall pages newest-first; the wish page lists a wish's gifts newest-first.
create index wishes_created_at_idx on public.wishes (created_at desc);
create index gifts_wish_id_created_at_idx on public.gifts (wish_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Row level security: anyone can insert + read, nobody can update or delete
-- ---------------------------------------------------------------------------

alter table public.wishes enable row level security;
alter table public.gifts  enable row level security;

-- Both roles are listed on purpose: plain visitors use `anon`, and visitors who did
-- supabase.auth.signInAnonymously() use `authenticated`.
create policy "anyone can read wishes"
  on public.wishes for select to anon, authenticated using (true);
create policy "anyone can insert wishes"
  on public.wishes for insert to anon, authenticated with check (true);

create policy "anyone can read gifts"
  on public.gifts for select to anon, authenticated using (true);
create policy "anyone can insert gifts"
  on public.gifts for insert to anon, authenticated with check (true);

-- No UPDATE or DELETE policies exist, so RLS already denies both. Also drop the
-- table privileges so the intent survives someone adding a permissive policy later.
revoke all on public.wishes, public.gifts from anon, authenticated;
grant select, insert on public.wishes, public.gifts to anon, authenticated;

-- Live wall + live gift timeline (the app subscribes to INSERTs).
alter publication supabase_realtime add table public.wishes, public.gifts;

-- ---------------------------------------------------------------------------
-- Rate limiting guidance. Items 2 and 3 are implemented in 0004_reports_and_rate_limits.sql;
-- the rest is background (nothing below is active in this file)
-- ---------------------------------------------------------------------------
-- With open INSERT policies, the anon key ships in the browser bundle, so anyone can
-- script inserts. RLS cannot throttle on its own. Layer these, cheapest first:
--
-- 1. Supabase Auth rate limits (Dashboard -> Authentication -> Rate Limits).
--    If the app keeps using signInAnonymously(), the "anonymous sign-ins" limit is a
--    per-IP cap on how many fresh identities one client can mint. Lower it
--    (e.g. 10-30/hour). Add CAPTCHA (Turnstile / hCaptcha) under Authentication ->
--    Attack Protection if bots show up.
--
-- 2. Per-identity quotas in a BEFORE INSERT trigger. Needs a column that identifies
--    the sender, which this schema deliberately doesn't have. To enable:
--      alter table public.wishes add column session_id uuid not null default auth.uid();
--      alter table public.gifts  add column session_id uuid not null default auth.uid();
--    then, for example:
--      create function public.limit_wishes() returns trigger
--      language plpgsql security definer set search_path = public as $fn$
--      begin
--        if (select count(*) from public.wishes
--             where session_id = new.session_id
--               and created_at > now() - interval '1 hour') >= 5 then
--          raise exception 'Rate limit: 5 wishes per hour';
--        end if;
--        return new;
--      end $fn$;
--      create trigger wishes_rate_limit before insert on public.wishes
--        for each row execute function public.limit_wishes();
--    Suggested starting limits: 5 wishes/hour, 30 gifts/hour per session. Note this
--    only stops casual abuse: a script can create new anonymous sessions.
--
-- 3. Per-IP limits in a trigger. PostgREST exposes request headers:
--      current_setting('request.headers', true)::json ->> 'x-forwarded-for'
--    Store that (or a hash of it) in an `ip_hash` column and count recent rows the same
--    way as above. Treat the header as best-effort; keep only a hash for privacy.
--
-- 4. Edge-level throttling (strongest). Put inserts behind a Vercel serverless function
--    or Supabase Edge Function that applies a real rate limiter (Vercel Firewall rate
--    limiting, Upstash Ratelimit, etc.), then revoke the direct INSERT grant above and
--    let only the function (service role) write.
--
-- 5. Content guardrails: the CHECK constraints above cap lengths; the client also
--    filters links/slurs (src/lib/moderation.ts). Since nobody can delete via the API,
--    moderate by hand: `delete from public.wishes where id = '...';` in the SQL editor
--    (gifts cascade).
