create table if not exists livechat_sessions (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references channels(id) on delete cascade,
  channel_slug text not null,
  session_token text not null unique,
  visitor_name text not null default 'Guest',
  discord_thread_id text,
  last_discord_message_id text,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists livechat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references livechat_sessions(id) on delete cascade,
  sender text not null check (sender in ('viewer', 'agent', 'system')),
  body text not null check (length(trim(body)) > 0 and length(body) <= 1000),
  discord_message_id text unique,
  created_at timestamptz not null default now()
);

create index if not exists livechat_sessions_channel_slug_idx on livechat_sessions(channel_slug);
create index if not exists livechat_messages_session_created_idx on livechat_messages(session_id, created_at);

alter table livechat_sessions enable row level security;
alter table livechat_messages enable row level security;

create policy livechat_sessions_owner_read on livechat_sessions
for select using (
  exists (
    select 1 from channels c
    where c.id = channel_id and c.owner_id = auth.uid()
  )
);

create policy livechat_messages_owner_read on livechat_messages
for select using (
  exists (
    select 1
    from livechat_sessions s
    join channels c on c.id = s.channel_id
    where s.id = session_id and c.owner_id = auth.uid()
  )
);
