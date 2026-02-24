create table if not exists loyalty_items (
  id             uuid primary key default gen_random_uuid(),
  channel_id     uuid not null references channels(id) on delete cascade,
  name           text not null,
  cost           integer not null default 100,
  cooldown_secs  integer not null default 0,
  created_at     timestamptz not null default now()
);

alter table loyalty_items enable row level security;
