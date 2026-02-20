-- supabase/migrations/20260220181000_antabuse.sql
create table if not exists viewer_blacklist (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references channels(id) on delete cascade,
  viewer_id text not null,
  reason text,
  created_at timestamptz not null default now(),
  unique(channel_id, viewer_id)
);

create table if not exists viewer_cooldowns (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references channels(id) on delete cascade,
  viewer_id text not null,
  action text not null,
  cooldown_until timestamptz not null,
  created_at timestamptz not null default now(),
  unique(channel_id, viewer_id, action)
);
