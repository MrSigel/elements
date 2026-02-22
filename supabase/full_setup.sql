-- Full Supabase setup SQL (generated)

-- ===== BEGIN 20260220161000_init.sql =====

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

-- ===== END 20260220161000_init.sql =====


-- ===== BEGIN 20260220162000_event_rpc.sql =====

-- supabase/migrations/20260220162000_event_rpc.sql
create or replace function apply_widget_event(
  p_channel_id uuid,
  p_overlay_id uuid,
  p_widget_instance_id uuid,
  p_widget_type widget_kind,
  p_event_type text,
  p_payload jsonb,
  p_actor_id uuid
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_event_id uuid;
begin
  insert into widget_events (
    channel_id, overlay_id, widget_instance_id, widget_type, event_type, payload, actor_id
  ) values (
    p_channel_id, p_overlay_id, p_widget_instance_id, p_widget_type, p_event_type, p_payload, p_actor_id
  ) returning id into v_event_id;

  insert into widget_snapshots (
    channel_id, overlay_id, widget_instance_id, widget_type, state, updated_at
  ) values (
    p_channel_id, p_overlay_id, p_widget_instance_id, p_widget_type, p_payload, now()
  )
  on conflict (overlay_id, widget_instance_id)
  do update set state = excluded.state, updated_at = now();

  insert into audit_logs (channel_id, actor_id, action, metadata)
  values (p_channel_id, p_actor_id, p_event_type, jsonb_build_object('widget_type', p_widget_type, 'event_id', v_event_id));

  return v_event_id;
end;
$$;

-- ===== END 20260220162000_event_rpc.sql =====


-- ===== BEGIN 20260220173000_uniques.sql =====

-- supabase/migrations/20260220173000_uniques.sql
alter table bonushunts add constraint bonushunts_channel_overlay_unique unique (channel_id, overlay_id);
alter table tournaments add constraint tournaments_channel_overlay_name_unique unique (channel_id, overlay_id, name);
alter table wheels add constraint wheels_channel_overlay_title_unique unique (channel_id, overlay_id, title);
alter table wagers add constraint wagers_overlay_unique unique (overlay_id);

-- ===== END 20260220173000_uniques.sql =====


-- ===== BEGIN 20260220181000_antabuse.sql =====

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

-- ===== END 20260220181000_antabuse.sql =====


-- ===== BEGIN 20260221130000_twitch_user_tokens.sql =====

alter table users
  add column if not exists twitch_access_token text,
  add column if not exists twitch_refresh_token text,
  add column if not exists twitch_token_expires_at timestamptz,
  add column if not exists twitch_token_scope text[];

-- ===== END 20260221130000_twitch_user_tokens.sql =====


-- ===== BEGIN 20260222000000_aggregated_snapshots.sql =====

create or replace function apply_widget_event(
  p_channel_id uuid,
  p_overlay_id uuid,
  p_widget_instance_id uuid,
  p_widget_type widget_kind,
  p_event_type text,
  p_payload jsonb,
  p_actor_id uuid
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_event_id uuid;
  v_state    jsonb := '{}'::jsonb;
  v_hunt_id       uuid;
  v_tournament_id uuid;
  v_battle_id     uuid;
  v_wheel_id      uuid;
  v_pb_id         uuid;
begin
  insert into widget_events (
    channel_id, overlay_id, widget_instance_id, widget_type, event_type, payload, actor_id
  ) values (
    p_channel_id, p_overlay_id, p_widget_instance_id, p_widget_type, p_event_type, p_payload, p_actor_id
  ) returning id into v_event_id;

  if p_widget_type = 'wager_bar' then
    select jsonb_build_object('value', coalesce(value, 0))
    into v_state from wagers where overlay_id = p_overlay_id limit 1;

  elsif p_widget_type = 'current_playing' then
    select jsonb_build_object('game_name', game_name, 'game_identifier', game_identifier, 'provider', provider)
    into v_state from current_playing where channel_id = p_channel_id limit 1;

  elsif p_widget_type = 'deposit_withdrawal' then
    select jsonb_build_object(
      'tx_type', t.tx_type, 'amount', t.amount, 'source', t.source,
      'total_deposits',    coalesce((select sum(amount) from transactions where channel_id = p_channel_id and tx_type = 'deposit'),    0),
      'total_withdrawals', coalesce((select sum(amount) from transactions where channel_id = p_channel_id and tx_type = 'withdrawal'), 0),
      'balance',           coalesce((select sum(case when tx_type='deposit' then amount else -amount end) from transactions where channel_id = p_channel_id), 0)
    ) into v_state from transactions t where t.channel_id = p_channel_id order by t.created_at desc limit 1;

  elsif p_widget_type = 'bonushunt' then
    select id into v_hunt_id from bonushunts where channel_id = p_channel_id and overlay_id = p_overlay_id order by updated_at desc limit 1;
    if v_hunt_id is not null then
      select jsonb_build_object(
        'title', h.title, 'status', h.status,
        'total',        (select count(*)                            from bonushunt_entries where bonushunt_id = h.id),
        'opened',       (select count(*)                            from bonushunt_entries where bonushunt_id = h.id and opened = true),
        'total_buyins', (select coalesce(sum(bet), 0)               from bonushunt_entries where bonushunt_id = h.id),
        'total_win',    (select coalesce(sum(result_win), 0)        from bonushunt_entries where bonushunt_id = h.id and opened = true),
        'best_x',       (select coalesce(max(result_multiplier), 0) from bonushunt_entries where bonushunt_id = h.id and opened = true),
        'biggest_win',  (select coalesce(max(result_win), 0)        from bonushunt_entries where bonushunt_id = h.id and opened = true),
        'entries', (select coalesce(jsonb_agg(jsonb_build_object(
          'slot_name', e.slot_name, 'provider', coalesce(e.provider,''), 'bet', e.bet, 'cost', e.cost,
          'opened', e.opened, 'win', coalesce(e.result_win,0), 'multiplier', coalesce(e.result_multiplier,0)
        ) order by e.created_at), '[]'::jsonb) from bonushunt_entries e where e.bonushunt_id = h.id)
      ) into v_state from bonushunts h where h.id = v_hunt_id;
    end if;

  elsif p_widget_type = 'tournament' then
    select id into v_tournament_id from tournaments where channel_id = p_channel_id and overlay_id = p_overlay_id order by created_at desc limit 1;
    if v_tournament_id is not null then
      select jsonb_build_object('name', t.name,
        'standings', (select coalesce(jsonb_agg(jsonb_build_object('participant', ts.participant, 'score', ts.score) order by ts.score desc), '[]'::jsonb)
          from tournament_scores ts where ts.tournament_id = t.id)
      ) into v_state from tournaments t where t.id = v_tournament_id;
    end if;

  elsif p_widget_type = 'slot_battle' then
    select id into v_battle_id from slot_battles where channel_id = p_channel_id and overlay_id = p_overlay_id order by created_at desc limit 1;
    if v_battle_id is not null then
      select jsonb_build_object('slot_a', slot_a, 'slot_b', slot_b, 'round', round,
        'score_a', score_a, 'score_b', score_b, 'status', status, 'stage', 'Stage ' || round::text)
      into v_state from slot_battles where id = v_battle_id;
    end if;

  elsif p_widget_type = 'slot_requests' then
    select jsonb_build_object(
      'requests', (select coalesce(jsonb_agg(jsonb_build_object('slot_name', sr.slot_name, 'username', sr.twitch_user_id, 'status', sr.status) order by sr.created_at desc), '[]'::jsonb)
        from slot_requests sr where sr.channel_id = p_channel_id and sr.status = 'open'),
      'winner', (select jsonb_build_object('slot_name', sr.slot_name, 'username', sr.twitch_user_id)
        from raffles r join slot_requests sr on sr.id = r.winner_request_id
        where r.channel_id = p_channel_id order by r.created_at desc limit 1)
    ) into v_state;

  elsif p_widget_type = 'hot_words' then
    select jsonb_build_object('words', (
      select coalesce(jsonb_agg(sub.obj order by sub.hit_count desc), '[]'::jsonb)
      from (select jsonb_build_object('phrase', hw.phrase, 'count', count(hwo.id)) as obj, count(hwo.id) as hit_count
        from hot_words hw left join hot_word_occurrences hwo on hwo.hot_word_id = hw.id
        where hw.channel_id = p_channel_id group by hw.id, hw.phrase) sub
    )) into v_state;

  elsif p_widget_type = 'wheel' then
    select id into v_wheel_id from wheels where channel_id = p_channel_id and overlay_id = p_overlay_id order by created_at desc limit 1;
    if v_wheel_id is not null then
      select jsonb_build_object('segments', w.segments,
        'result',       (select result->>'value' from wheel_spins where wheel_id = w.id order by created_at desc limit 1),
        'result_index', (select (result->>'index')::int from wheel_spins where wheel_id = w.id order by created_at desc limit 1)
      ) into v_state from wheels w where w.id = v_wheel_id;
    end if;

  elsif p_widget_type = 'personal_bests' then
    select jsonb_build_object('metrics', (
      select coalesce(jsonb_agg(jsonb_build_object('metric_key', pb.metric_key, 'metric_value', pb.metric_value) order by pb.updated_at desc), '[]'::jsonb)
      from personal_bests pb where pb.channel_id = p_channel_id
    )) into v_state;

  elsif p_widget_type = 'quick_guessing' then
    select jsonb_build_object(
      'open', (p_event_type = 'guessing_open'),
      'messages', (select coalesce(jsonb_agg(sub.obj), '[]'::jsonb) from (
        select jsonb_build_object('user', g.twitch_user_id, 'text', g.value::text) as obj
        from guesses g join bonushunts bh on bh.id = g.bonushunt_id
        where bh.channel_id = p_channel_id order by g.created_at desc limit 20
      ) sub)
    ) into v_state;

  elsif p_widget_type = 'loyalty' then
    select jsonb_build_object(
      'total_points_granted', coalesce((select sum(points_delta) from points_ledger where channel_id = p_channel_id and points_delta > 0), 0),
      'store_items', (select coalesce(jsonb_agg(jsonb_build_object('name', name, 'cost', cost) order by cost), '[]'::jsonb)
        from store_items where channel_id = p_channel_id and is_active = true),
      'recent_redemptions', (select coalesce(jsonb_agg(jsonb_build_object('user', r.twitch_user_id, 'item', si.name) order by r.created_at desc), '[]'::jsonb)
        from (select twitch_user_id, store_item_id, created_at from redemptions where channel_id = p_channel_id order by created_at desc limit 5) r
        join store_items si on si.id = r.store_item_id)
    ) into v_state;

  elsif p_widget_type = 'points_battle' then
    select id into v_pb_id from points_battles where channel_id = p_channel_id and overlay_id = p_overlay_id order by created_at desc limit 1;
    if v_pb_id is not null then
      select jsonb_build_object(
        'team_a', pb.team_a, 'team_b', pb.team_b, 'entry_cost', pb.entry_cost, 'status', pb.status, 'ends_at', pb.ends_at,
        'score_a', coalesce((select sum(points) from points_battle_entries where points_battle_id = pb.id and team = pb.team_a), 0),
        'score_b', coalesce((select sum(points) from points_battle_entries where points_battle_id = pb.id and team = pb.team_b), 0),
        'count_a', (select count(*) from points_battle_entries where points_battle_id = pb.id and team = pb.team_a),
        'count_b', (select count(*) from points_battle_entries where points_battle_id = pb.id and team = pb.team_b)
      ) into v_state from points_battles pb where pb.id = v_pb_id;
    end if;
  end if;

  if v_state is null then v_state := p_payload; end if;

  insert into widget_snapshots (channel_id, overlay_id, widget_instance_id, widget_type, state, updated_at)
  values (p_channel_id, p_overlay_id, p_widget_instance_id, p_widget_type, v_state, now())
  on conflict (overlay_id, widget_instance_id)
  do update set state = excluded.state, updated_at = now();

  insert into audit_logs (channel_id, actor_id, action, metadata)
  values (p_channel_id, p_actor_id, p_event_type, jsonb_build_object('widget_type', p_widget_type, 'event_id', v_event_id));

  return v_event_id;
end;
$$;

-- ===== END 20260222000000_aggregated_snapshots.sql =====

-- ===== BEGIN 20260222110000_bot_active.sql =====

alter table channels
  add column if not exists bot_active boolean not null default false;

-- ===== END 20260222110000_bot_active.sql =====


