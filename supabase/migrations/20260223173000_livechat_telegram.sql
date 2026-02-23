alter table livechat_sessions
  add column if not exists telegram_chat_id text,
  add column if not exists last_telegram_update_id bigint;

alter table livechat_messages
  add column if not exists telegram_message_id text unique;

create table if not exists livechat_runtime_state (
  key text primary key,
  value_text text not null default '',
  updated_at timestamptz not null default now()
);

