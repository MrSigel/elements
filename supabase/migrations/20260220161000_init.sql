-- supabase/migrations/20260220161000_init.sql
create extension if not exists pgcrypto;

create type role_type as enum ('owner','moderator');
create type widget_kind as enum (
  'bonushunt','tournament','slot_battle','deposit_withdrawal','wager_bar','current_playing',
  'slot_requests','hot_words','wheel','personal_bests','quick_guessing','loyalty','points_battle'
);

create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  twitch_user_id text unique not null,
  twitch_login text unique not null,
  twitch_display_name text not null,
  avatar_url text,
  twitch_access_token text,
  twitch_refresh_token text,
  twitch_token_expires_at timestamptz,
  twitch_token_scope text[],
  created_at timestamptz not null default now()
);

create table if not exists channels (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references users(id) on delete cascade,
  twitch_channel_id text unique not null,
  slug text unique not null,
  title text not null,
  created_at timestamptz not null default now()
);

create table if not exists channel_roles (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references channels(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role role_type not null,
  created_at timestamptz not null default now(),
  unique(channel_id,user_id)
);

create table if not exists permissions (
  id uuid primary key default gen_random_uuid(),
  channel_role_id uuid not null references channel_roles(id) on delete cascade,
  overlay_id uuid,
  widget_instance_id uuid,
  permission_key text not null,
  created_at timestamptz not null default now()
);

create table if not exists overlays (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references channels(id) on delete cascade,
  name text not null,
  width int not null,
  height int not null,
  theme jsonb not null default '{}'::jsonb,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists overlay_tokens (
  id uuid primary key default gen_random_uuid(),
  overlay_id uuid not null unique references overlays(id) on delete cascade,
  public_token text not null unique,
  revoked boolean not null default false,
  created_at timestamptz not null default now(),
  rotated_at timestamptz
);

create table if not exists overlay_instances (
  id uuid primary key default gen_random_uuid(),
  overlay_id uuid not null references overlays(id) on delete cascade,
  revision int not null default 1,
  layout jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists widget_instances (
  id uuid primary key default gen_random_uuid(),
  overlay_id uuid not null references overlays(id) on delete cascade,
  kind widget_kind not null,
  name text not null,
  layer_index int not null default 0,
  x numeric not null default 0,
  y numeric not null default 0,
  width numeric not null default 300,
  height numeric not null default 180,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists widget_configs (
  id uuid primary key default gen_random_uuid(),
  widget_instance_id uuid not null unique references widget_instances(id) on delete cascade,
  config jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists widget_events (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references channels(id) on delete cascade,
  overlay_id uuid references overlays(id) on delete cascade,
  widget_instance_id uuid references widget_instances(id) on delete set null,
  widget_type widget_kind not null,
  event_type text not null,
  payload jsonb not null,
  actor_id uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists widget_snapshots (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references channels(id) on delete cascade,
  overlay_id uuid not null references overlays(id) on delete cascade,
  widget_instance_id uuid references widget_instances(id) on delete cascade,
  widget_type widget_kind not null,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique(overlay_id, widget_instance_id)
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references channels(id) on delete cascade,
  actor_id uuid references users(id) on delete set null,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists viewer_pages (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references channels(id) on delete cascade,
  overlay_id uuid not null references overlays(id) on delete cascade,
  page_type text not null,
  enabled boolean not null default true,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(overlay_id,page_type)
);

create table if not exists viewer_tokens (
  id uuid primary key default gen_random_uuid(),
  viewer_page_id uuid not null unique references viewer_pages(id) on delete cascade,
  public_token text unique not null,
  revoked boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists rate_limits (
  id uuid primary key default gen_random_uuid(),
  scope text not null,
  scope_id text not null,
  action text not null,
  window_start timestamptz not null,
  hit_count int not null default 1,
  unique(scope,scope_id,action,window_start)
);

create table if not exists chat_commands (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references channels(id) on delete cascade,
  command text not null,
  handler text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists points_ledger (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references channels(id) on delete cascade,
  twitch_user_id text not null,
  points_delta int not null,
  reason text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists store_items (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references channels(id) on delete cascade,
  name text not null,
  cost int not null,
  cooldown_seconds int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists redemptions (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references channels(id) on delete cascade,
  store_item_id uuid not null references store_items(id) on delete cascade,
  twitch_user_id text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists bonushunts (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references channels(id) on delete cascade,
  overlay_id uuid not null references overlays(id) on delete cascade,
  title text not null,
  status text not null default 'active',
  totals jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists bonushunt_entries (
  id uuid primary key default gen_random_uuid(),
  bonushunt_id uuid not null references bonushunts(id) on delete cascade,
  slot_name text not null,
  provider text,
  bet numeric not null,
  cost numeric not null,
  opened boolean not null default false,
  result_win numeric,
  result_multiplier numeric,
  created_at timestamptz not null default now()
);

create table if not exists guesses (
  id uuid primary key default gen_random_uuid(),
  bonushunt_id uuid not null references bonushunts(id) on delete cascade,
  twitch_user_id text not null,
  value numeric not null,
  created_at timestamptz not null default now(),
  unique(bonushunt_id,twitch_user_id)
);

create table if not exists tournaments (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references channels(id) on delete cascade,
  overlay_id uuid not null references overlays(id) on delete cascade,
  name text not null,
  starts_at timestamptz,
  ends_at timestamptz,
  scoring jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists tournament_scores (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  participant text not null,
  score numeric not null default 0,
  updated_at timestamptz not null default now(),
  unique(tournament_id,participant)
);

create table if not exists slot_battles (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references channels(id) on delete cascade,
  overlay_id uuid not null references overlays(id) on delete cascade,
  slot_a text not null,
  slot_b text not null,
  round int not null default 1,
  status text not null default 'idle',
  score_a numeric not null default 0,
  score_b numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references channels(id) on delete cascade,
  tx_type text not null check (tx_type in ('deposit','withdrawal')),
  amount numeric not null,
  source text not null default 'manual',
  created_at timestamptz not null default now()
);

create table if not exists wagers (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references channels(id) on delete cascade,
  overlay_id uuid not null references overlays(id) on delete cascade,
  value numeric not null,
  updated_at timestamptz not null default now()
);

create table if not exists current_playing (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references channels(id) on delete cascade,
  game_identifier text not null,
  game_name text not null,
  provider text not null,
  updated_at timestamptz not null default now(),
  unique(channel_id)
);

create table if not exists slot_requests (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references channels(id) on delete cascade,
  twitch_user_id text not null,
  slot_name text not null,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  unique(channel_id,twitch_user_id,slot_name)
);

create table if not exists raffles (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references channels(id) on delete cascade,
  title text not null,
  status text not null default 'open',
  winner_request_id uuid references slot_requests(id),
  created_at timestamptz not null default now()
);

create table if not exists hot_words (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references channels(id) on delete cascade,
  phrase text not null,
  cooldown_seconds int not null default 0,
  per_user_limit int not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists hot_word_occurrences (
  id uuid primary key default gen_random_uuid(),
  hot_word_id uuid not null references hot_words(id) on delete cascade,
  twitch_user_id text not null,
  created_at timestamptz not null default now()
);

create table if not exists wheels (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references channels(id) on delete cascade,
  overlay_id uuid not null references overlays(id) on delete cascade,
  title text not null,
  segments jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists wheel_spins (
  id uuid primary key default gen_random_uuid(),
  wheel_id uuid not null references wheels(id) on delete cascade,
  actor_id uuid references users(id),
  seed text not null,
  result jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists personal_bests (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references channels(id) on delete cascade,
  metric_key text not null,
  metric_value numeric not null,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique(channel_id, metric_key)
);

create table if not exists points_battles (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references channels(id) on delete cascade,
  overlay_id uuid not null references overlays(id) on delete cascade,
  team_a text not null,
  team_b text not null,
  entry_cost int not null,
  status text not null default 'idle',
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists points_battle_entries (
  id uuid primary key default gen_random_uuid(),
  points_battle_id uuid not null references points_battles(id) on delete cascade,
  twitch_user_id text not null,
  team text not null,
  points int not null,
  created_at timestamptz not null default now(),
  unique(points_battle_id,twitch_user_id)
);

alter table users enable row level security;
alter table channels enable row level security;
alter table overlays enable row level security;
alter table widget_instances enable row level security;
alter table widget_configs enable row level security;
alter table widget_events enable row level security;
alter table widget_snapshots enable row level security;
alter table viewer_pages enable row level security;
alter table viewer_tokens enable row level security;
alter table slot_requests enable row level security;

create or replace function is_channel_owner(c_id uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from channels c
    where c.id = c_id and c.owner_id = auth.uid()
  );
$$;

create or replace function is_channel_mod(c_id uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from channel_roles cr
    where cr.channel_id = c_id and cr.user_id = auth.uid() and cr.role in ('owner','moderator')
  );
$$;

create policy users_self on users
for all using (id = auth.uid()) with check (id = auth.uid());

create policy channels_owner_or_mod on channels
for select using (is_channel_owner(id) or is_channel_mod(id));
create policy channels_owner_write on channels
for all using (is_channel_owner(id)) with check (is_channel_owner(id));

create policy overlays_read on overlays
for select using (is_channel_owner(channel_id) or is_channel_mod(channel_id));
create policy overlays_write on overlays
for all using (is_channel_owner(channel_id) or is_channel_mod(channel_id))
with check (is_channel_owner(channel_id) or is_channel_mod(channel_id));

create policy widget_instances_read on widget_instances
for select using (
  exists(select 1 from overlays o where o.id = overlay_id and (is_channel_owner(o.channel_id) or is_channel_mod(o.channel_id)))
);
create policy widget_instances_write on widget_instances
for all using (
  exists(select 1 from overlays o where o.id = overlay_id and (is_channel_owner(o.channel_id) or is_channel_mod(o.channel_id)))
)
with check (
  exists(select 1 from overlays o where o.id = overlay_id and (is_channel_owner(o.channel_id) or is_channel_mod(o.channel_id)))
);

create policy widget_configs_policy on widget_configs
for all using (
  exists(
    select 1 from widget_instances wi join overlays o on o.id = wi.overlay_id
    where wi.id = widget_instance_id and (is_channel_owner(o.channel_id) or is_channel_mod(o.channel_id))
  )
) with check (
  exists(
    select 1 from widget_instances wi join overlays o on o.id = wi.overlay_id
    where wi.id = widget_instance_id and (is_channel_owner(o.channel_id) or is_channel_mod(o.channel_id))
  )
);

create policy widget_events_rw on widget_events
for all using (is_channel_owner(channel_id) or is_channel_mod(channel_id))
with check (is_channel_owner(channel_id) or is_channel_mod(channel_id));

create policy widget_snapshots_rw on widget_snapshots
for all using (is_channel_owner(channel_id) or is_channel_mod(channel_id))
with check (is_channel_owner(channel_id) or is_channel_mod(channel_id));

create policy viewer_pages_rw on viewer_pages
for all using (is_channel_owner(channel_id) or is_channel_mod(channel_id))
with check (is_channel_owner(channel_id) or is_channel_mod(channel_id));

create policy viewer_tokens_rw on viewer_tokens
for all using (
  exists(select 1 from viewer_pages vp where vp.id = viewer_page_id and (is_channel_owner(vp.channel_id) or is_channel_mod(vp.channel_id)))
)
with check (
  exists(select 1 from viewer_pages vp where vp.id = viewer_page_id and (is_channel_owner(vp.channel_id) or is_channel_mod(vp.channel_id)))
);

create policy slot_requests_public_insert on slot_requests
for insert with check (true);
create policy slot_requests_owner_read on slot_requests
for select using (is_channel_owner(channel_id) or is_channel_mod(channel_id));

alter publication supabase_realtime add table widget_snapshots;
alter publication supabase_realtime add table widget_events;

