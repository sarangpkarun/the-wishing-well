-- Shared by "Most Generous Fake Billionaire" (leaderboards) and the wealth meter / rich list.
-- One row per sender alias. Needs no new tables: it's derived from public.gifts.
--
-- security_invoker: the view runs with the caller's privileges, so the same RLS that guards
-- public.gifts applies (gifts are world-readable, so this stays world-readable).

create index if not exists gifts_sender_alias_idx on public.gifts (sender_alias);

create or replace view public.alias_stats with (security_invoker = true) as
select
  sender_alias,
  count(*)::int                  as gifts,
  count(distinct wish_id)::int   as wishes_granted,
  max(created_at)                as last_gift_at
from public.gifts
group by sender_alias;

grant select on public.alias_stats to anon, authenticated;
