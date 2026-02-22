alter table channels
  add column if not exists bot_active boolean not null default false;
