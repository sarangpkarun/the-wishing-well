-- The Wishing Well: schema, RLS, rate limits, reveal RPC, realtime.
-- Requires: Authentication -> Providers -> "Allow anonymous sign-ins" enabled.

create table public.wishes (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null default auth.uid(),
  text        text not null check (char_length(text) between 3 and 200),
  nickname    text check (char_length(nickname) <= 30),
  gift_count  int  not null default 0,
  hidden      boolean not null default false,
  created_at  timestamptz not null default now()
);

create table public.gifts (
  id            uuid primary key default gen_random_uuid(),
  wish_id       uuid not null references public.wishes(id) on delete cascade,
  sender_id     uuid not null default auth.uid(),
  gift_key      text not null check (char_length(gift_key) <= 64),
  sender_alias  text not null check (char_length(sender_alias) <= 60),
  message       text check (char_length(message) <= 140),
  receipt       jsonb not null,
  revealed_at   timestamptz,
  created_at    timestamptz not null default now()
);

create index gifts_wish_idx on public.gifts (wish_id, created_at desc);
create index wishes_feed_idx on public.wishes (created_at desc) where not hidden;
create index wishes_owner_idx on public.wishes (owner_id, created_at desc);

alter table public.wishes enable row level security;
alter table public.gifts  enable row level security;

-- wishes
create policy "wishes readable" on public.wishes
  for select using (not hidden or owner_id = auth.uid());
create policy "wishes insert own" on public.wishes
  for insert to authenticated with check (owner_id = auth.uid());
create policy "wishes delete own" on public.wishes
  for delete to authenticated using (owner_id = auth.uid());

-- gifts: world-readable (the wall is public); the receipt is "frozen" at insert.
create policy "gifts readable" on public.gifts
  for select using (true);
create policy "gifts insert own" on public.gifts
  for insert to authenticated with check (sender_id = auth.uid());

-- Only the safe columns of a new gift may be supplied: revealed_at must start null.
create or replace function public.gifts_before_insert() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  wish_owner uuid;
  recent int;
begin
  new.revealed_at := null;

  select owner_id into wish_owner from public.wishes where id = new.wish_id and not hidden;
  if wish_owner is null then
    raise exception 'Wish not found';
  end if;
  if wish_owner = new.sender_id then
    raise exception 'You cannot grant your own wish. Nice try, though.';
  end if;

  select count(*) into recent from public.gifts
    where sender_id = new.sender_id and created_at > now() - interval '1 hour';
  if recent >= 30 then
    raise exception 'Slow down, big spender. Try again later.';
  end if;

  update public.wishes set gift_count = gift_count + 1 where id = new.wish_id;
  return new;
end $$;

create trigger gifts_before_insert before insert on public.gifts
  for each row execute function public.gifts_before_insert();

create or replace function public.wishes_before_insert() returns trigger
language plpgsql security definer set search_path = public as $$
declare recent int;
begin
  new.gift_count := 0;
  new.hidden := false;
  select count(*) into recent from public.wishes
    where owner_id = new.owner_id and created_at > now() - interval '1 hour';
  if recent >= 5 then
    raise exception 'The well is tired. Wish again in a bit.';
  end if;
  return new;
end $$;

create trigger wishes_before_insert before insert on public.wishes
  for each row execute function public.wishes_before_insert();

-- Wisher opens a gift. No client UPDATE policy exists; this is the only path.
create or replace function public.reveal_gift(p_gift_id uuid) returns public.gifts
language plpgsql security definer set search_path = public as $$
declare g public.gifts;
begin
  update public.gifts set revealed_at = coalesce(revealed_at, now())
   where id = p_gift_id
     and wish_id in (select id from public.wishes where owner_id = auth.uid())
  returning * into g;
  if g.id is null then
    raise exception 'Not your gift to open';
  end if;
  return g;
end $$;

revoke all on function public.reveal_gift(uuid) from public, anon;
grant execute on function public.reveal_gift(uuid) to authenticated;

alter publication supabase_realtime add table public.wishes, public.gifts;
