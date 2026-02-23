-- Per-widget OBS BrowserSource tokens
-- Each widget instance can have its own public URL for OBS, independent of the main overlay token.
create table widget_tokens (
  id               uuid primary key default gen_random_uuid(),
  widget_instance_id uuid not null unique references widget_instances(id) on delete cascade,
  public_token     text not null unique,
  revoked          boolean not null default false,
  created_at       timestamptz not null default now(),
  rotated_at       timestamptz
);
