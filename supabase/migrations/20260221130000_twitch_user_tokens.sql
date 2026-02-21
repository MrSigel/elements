alter table users
  add column if not exists twitch_access_token text,
  add column if not exists twitch_refresh_token text,
  add column if not exists twitch_token_expires_at timestamptz,
  add column if not exists twitch_token_scope text[];

