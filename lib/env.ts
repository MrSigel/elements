import { z } from "zod";

function clean(value: string | undefined) {
  if (typeof value !== "string") return value;
  return value.trim().replace(/^["']|["']$/g, "");
}

const schema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_JWT_SECRET: z.string().min(1),
  TWITCH_CLIENT_ID: z.string().optional().default(""),
  TWITCH_CLIENT_SECRET: z.string().optional().default(""),
  TWITCH_REDIRECT_URI: z.string().optional().default(""),
  TWITCH_BOT_OAUTH_TOKEN: z.string().optional().default(""),
  TWITCH_BOT_USERNAME: z.string().optional().default(""),
  TELEGRAM_BOT_TOKEN: z.string().optional().default(""),
  TELEGRAM_LIVECHAT_ID: z.string().optional().default(""),
  INGEST_SHARED_SECRET: z.string().min(32),
  CRYPTAPI_WALLET_BTC: z.string().default(""),
  CRYPTAPI_WALLET_ETH: z.string().default(""),
  CRYPTAPI_WALLET_USDT_TRC20: z.string().default(""),
  CRYPTAPI_WALLET_LTC: z.string().default(""),
  CRYPTAPI_WEBHOOK_SECRET: z.string().default("")
});

export const env = schema.parse({
  NEXT_PUBLIC_APP_URL: clean(process.env.NEXT_PUBLIC_APP_URL),
  NEXT_PUBLIC_SUPABASE_URL: clean(process.env.NEXT_PUBLIC_SUPABASE_URL),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  SUPABASE_SERVICE_ROLE_KEY: clean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  SUPABASE_JWT_SECRET: clean(process.env.SUPABASE_JWT_SECRET),
  TWITCH_CLIENT_ID: clean(process.env.TWITCH_CLIENT_ID),
  TWITCH_CLIENT_SECRET: clean(process.env.TWITCH_CLIENT_SECRET),
  TWITCH_REDIRECT_URI: clean(process.env.TWITCH_REDIRECT_URI),
  TWITCH_BOT_OAUTH_TOKEN: clean(process.env.TWITCH_BOT_OAUTH_TOKEN),
  TWITCH_BOT_USERNAME: clean(process.env.TWITCH_BOT_USERNAME),
  TELEGRAM_BOT_TOKEN: clean(process.env.TELEGRAM_BOT_TOKEN),
  TELEGRAM_LIVECHAT_ID: clean(process.env.TELEGRAM_LIVECHAT_ID),
  INGEST_SHARED_SECRET: clean(process.env.INGEST_SHARED_SECRET),
  CRYPTAPI_WALLET_BTC: clean(process.env.CRYPTAPI_WALLET_BTC),
  CRYPTAPI_WALLET_ETH: clean(process.env.CRYPTAPI_WALLET_ETH),
  CRYPTAPI_WALLET_USDT_TRC20: clean(process.env.CRYPTAPI_WALLET_USDT_TRC20),
  CRYPTAPI_WALLET_LTC: clean(process.env.CRYPTAPI_WALLET_LTC),
  CRYPTAPI_WEBHOOK_SECRET: clean(process.env.CRYPTAPI_WEBHOOK_SECRET)
});
