-- Subscription plan tracking on channels
alter table channels
  add column if not exists subscription_plan text not null default 'starter',
  add column if not exists subscription_status text not null default 'active',
  add column if not exists subscription_expires_at timestamptz;

-- Crypto payment sessions (one per checkout attempt)
create table if not exists crypto_payments (
  id            uuid primary key default gen_random_uuid(),
  channel_id    uuid not null references channels(id) on delete cascade,
  plan          text not null,            -- 'pro' | 'enterprise'
  coin          text not null,            -- 'btc' | 'eth' | 'trc20/usdt' | 'ltc'
  amount_eur    numeric not null,         -- EUR price at creation time
  expected_coin numeric not null,         -- crypto amount expected (from /convert/)
  address_in    text,                     -- CryptAPI-assigned unique payment address
  status        text not null default 'pending',  -- 'pending' | 'confirmed' | 'expired'
  capi_uuid     text,                     -- CryptAPI transaction UUID (from callback)
  value_coin    numeric,                  -- actual crypto received
  txid          text,                     -- blockchain transaction ID
  created_at    timestamptz not null default now(),
  confirmed_at  timestamptz,
  expires_at    timestamptz not null default (now() + interval '2 hours')
);
