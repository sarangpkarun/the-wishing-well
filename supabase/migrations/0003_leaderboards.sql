-- Views behind "Most Broke Wisher" and "Most Unrealistic Wish".
-- Ranking by gift counts only, as requested. Both are read-only views over existing tables.

-- One row per wish with how many gifts it received.
create or replace view public.wish_stats with (security_invoker = true) as
select
  w.id,
  w.text,
  w.wisher_name,
  w.created_at,
  count(g.id)::int as gifts
from public.wishes w
left join public.gifts g on g.wish_id = w.id
group by w.id;

-- One row per named wisher. Anonymous wishes (null name) can't be attributed, so they're left out.
create or replace view public.wisher_stats with (security_invoker = true) as
select
  wisher_name,
  count(*)::int                            as wishes,
  (count(*) filter (where gifts = 0))::int as ungranted,
  coalesce(sum(gifts), 0)::int             as gifts
from public.wish_stats
where wisher_name is not null
group by wisher_name;

grant select on public.wish_stats, public.wisher_stats to anon, authenticated;
