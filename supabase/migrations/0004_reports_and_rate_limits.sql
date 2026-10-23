-- Reports + server-side rate limiting.
--
-- Part 1: public.reports. Anyone can file a report; nobody can read, change or delete them through
--         the API (you review them in the Supabase dashboard / SQL editor, which bypasses RLS).
-- Part 2: rate limits enforced in the database, so they hold even if someone skips the website and
--         calls the REST API directly with the (public) anon key.

-- ---------------------------------------------------------------------------
-- Part 1: reports
-- ---------------------------------------------------------------------------

create table public.reports (
  id          uuid primary key default gen_random_uuid(),
  wish_id     uuid not null references public.wishes (id) on delete cascade,
  reason      text not null check (reason in ('personal-info', 'offensive', 'spam', 'other')),
  details     text check (details is null or char_length(details) <= 200),
  created_at  timestamptz not null default now()
);

create index reports_wish_id_idx on public.reports (wish_id, created_at desc);

alter table public.reports enable row level security;

-- Insert only. No SELECT policy means reporters can't read each other's reports (or their own).
create policy "anyone can report" on public.reports
  for insert to anon, authenticated with check (true);

revoke all on public.reports from anon, authenticated;
grant insert on public.reports to anon, authenticated;

-- Review queue (run in the SQL editor): most-reported wishes first.
--   select w.id, w.text, w.wisher_name, count(*) as reports,
--          array_agg(distinct r.reason) as reasons, max(r.created_at) as latest
--   from public.reports r join public.wishes w on w.id = r.wish_id
--   group by w.id order by reports desc, latest desc;
--
-- Remove a wish (its gifts and reports cascade):
--   delete from public.wishes where id = '...';

-- ---------------------------------------------------------------------------
-- Part 2: rate limiting
-- ---------------------------------------------------------------------------
-- Two independent buckets per action, both counted over a rolling hour:
--   * session: the browser sends a random id in the `x-session-id` header. Precise for honest
--     visitors ("max 5 wishes per session per hour"), but a script can mint endless ids.
--   * ip: taken from the `x-forwarded-for` header Supabase sets, stored only as a salted hash.
--     Harder to dodge, so it's looser (people share Wi-Fi and phone networks).
-- Together they stop casual abuse. A determined attacker with many IPs needs a captcha or an
-- edge rate limiter in front of the API (see README).
--
-- Counters live in rate_limit_log, which has RLS on and no policies: the API can't read or write
-- it, so session ids and IP hashes never leak (and never reach Realtime). The trigger function is
-- SECURITY DEFINER, so it can.

create table public.rate_limit_log (
  id          bigint generated always as identity primary key,
  action      text not null,                                   -- table name: wishes | gifts | reports
  kind        text not null check (kind in ('session', 'ip')),
  key         text not null,                                   -- session id, or salted IP hash
  created_at  timestamptz not null default now()
);

create index rate_limit_log_lookup_idx on public.rate_limit_log (action, kind, key, created_at desc);

alter table public.rate_limit_log enable row level security;
revoke all on public.rate_limit_log from anon, authenticated;

create or replace function public.enforce_rate_limit() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  limit_session int := tg_argv[0]::int;
  limit_ip      int := tg_argv[1]::int;
  -- CHANGE THIS before launch. Only used so stored IP hashes can't be reversed by brute-forcing IPv4.
  salt constant text := 'wishing-well-change-me';
  hdrs     json;
  sess     text;
  ip       text;
  ip_key   text;
begin
  begin
    hdrs := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::json;
  exception when others then
    hdrs := '{}'::json;  -- no PostgREST context (SQL editor, seed script, migrations): nothing to limit
  end;

  sess := hdrs ->> 'x-session-id';
  if sess is not null and sess !~ '^[0-9a-fA-F-]{8,64}$' then
    sess := null;        -- malformed ids are ignored; the IP limit still applies
  end if;

  ip := nullif(btrim(split_part(coalesce(hdrs ->> 'x-forwarded-for', hdrs ->> 'cf-connecting-ip', ''), ',', 1)), '');
  ip_key := case when ip is null then null else md5(salt || ip) end;

  if sess is not null then
    if (select count(*) from public.rate_limit_log
         where action = tg_table_name and kind = 'session' and key = sess
           and created_at > now() - interval '1 hour') >= limit_session then
      raise exception 'Rate limit: you have hit the hourly limit for this. Try again later.'
        using errcode = 'P0001', hint = 'rate_limit';
    end if;
    insert into public.rate_limit_log (action, kind, key) values (tg_table_name, 'session', sess);
  end if;

  if ip_key is not null then
    if (select count(*) from public.rate_limit_log
         where action = tg_table_name and kind = 'ip' and key = ip_key
           and created_at > now() - interval '1 hour') >= limit_ip then
      raise exception 'Rate limit: too many requests from your network. Try again later.'
        using errcode = 'P0001', hint = 'rate_limit';
    end if;
    insert into public.rate_limit_log (action, kind, key) values (tg_table_name, 'ip', ip_key);
  end if;

  -- Housekeeping without needing pg_cron: ~2% of inserts trim rows older than a day.
  if random() < 0.02 then
    delete from public.rate_limit_log where created_at < now() - interval '1 day';
  end if;

  return new;
end $$;

revoke all on function public.enforce_rate_limit() from public, anon, authenticated;

-- (per-session limit per hour, per-IP limit per hour)
create trigger wishes_rate_limit  before insert on public.wishes
  for each row execute function public.enforce_rate_limit(5, 15);
create trigger gifts_rate_limit   before insert on public.gifts
  for each row execute function public.enforce_rate_limit(30, 90);
create trigger reports_rate_limit before insert on public.reports
  for each row execute function public.enforce_rate_limit(20, 60);
