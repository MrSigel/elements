-- Add website_config column to channels so config persists in the DB
-- (replaces the previous file-based JSON storage which doesn't survive Render.com deploys)
alter table channels
  add column if not exists website_config jsonb not null default '{}'::jsonb;
