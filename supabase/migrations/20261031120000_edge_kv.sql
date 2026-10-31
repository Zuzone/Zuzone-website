-- Key/value store for the Vercel edge layer (api/edge.mjs), replacing the Cloudflare KV
-- namespace ZUTHREAD: the cached ZuThread feed, refresh status/locks, and rate-limit counters.
-- Only the service role touches it: RLS is on with no policies, so anon/authenticated get nothing.
create table if not exists public.edge_kv (
  key text primary key,
  value text not null,
  expires_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists edge_kv_expires_at_idx on public.edge_kv (expires_at) where expires_at is not null;

alter table public.edge_kv enable row level security;
revoke all on public.edge_kv from anon, authenticated;
