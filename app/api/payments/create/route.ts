import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

const PLAN_PRICES: Record<string, number> = { pro: 150, enterprise: 300 };

const WALLET_MAP: Record<string, string> = {
  btc: env.CRYPTAPI_WALLET_BTC,
  eth: env.CRYPTAPI_WALLET_ETH,
  "trc20/usdt": env.CRYPTAPI_WALLET_USDT_TRC20,
  ltc: env.CRYPTAPI_WALLET_LTC,
};

const COIN_LABELS: Record<string, string> = {
  btc: "BTC",
  eth: "ETH",
  "trc20/usdt": "USDT (TRC20)",
  ltc: "LTC",
};

export async function POST(req: NextRequest) {
  const userClient = await createServerClient();
  const { data: auth } = await userClient.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null) as { plan?: string; coin?: string } | null;
  const plan = body?.plan;
  const coin = body?.coin;

  if (!plan || !PLAN_PRICES[plan]) return NextResponse.json({ error: "invalid_plan" }, { status: 400 });

  const VALID_COINS = ["btc", "eth", "trc20/usdt", "ltc"];
  if (!coin || !VALID_COINS.includes(coin)) return NextResponse.json({ error: "invalid_coin" }, { status: 400 });

  const wallet = WALLET_MAP[coin];
  if (!wallet) return NextResponse.json({ error: "wallet_not_configured", coin }, { status: 503 });

  const amountEur = PLAN_PRICES[plan];
  const admin = createServiceClient();

  // Get user's channel
  const { data: channel } = await admin.from("channels").select("id").eq("owner_id", auth.user.id).limit(1).maybeSingle();
  if (!channel) return NextResponse.json({ error: "channel_not_found" }, { status: 404 });

  // Convert EUR to crypto
  const convertRes = await fetch(`https://api.cryptapi.io/${coin}/convert/?value=${amountEur}&from=EUR`);
  const convertData = await convertRes.json() as { value_coin?: number; status?: string };
  if (!convertData.value_coin) return NextResponse.json({ error: "conversion_failed" }, { status: 502 });
  const expectedCoin = convertData.value_coin;

  // Insert pending payment (without address_in yet)
  const { data: payment, error: insertErr } = await admin.from("crypto_payments").insert({
    channel_id: channel.id,
    plan,
    coin,
    amount_eur: amountEur,
    expected_coin: expectedCoin,
  }).select("id, expires_at").single();

  if (insertErr || !payment) return NextResponse.json({ error: insertErr?.message ?? "db_error" }, { status: 500 });

  // Build callback URL (secret in query param so CryptAPI can't be spoofed)
  const callbackUrl = `${env.NEXT_PUBLIC_APP_URL}/api/payments/callback?payment_id=${payment.id}&secret=${encodeURIComponent(env.CRYPTAPI_WEBHOOK_SECRET)}`;

  // Create CryptAPI payment address
  const capiParams = new URLSearchParams({
    callback: callbackUrl,
    address: wallet,
    pending: "1",
    post: "1",
    json: "1",
  });
  const capiRes = await fetch(`https://api.cryptapi.io/${coin}/create/?${capiParams}`);
  const capiData = await capiRes.json() as { address_in?: string; status?: string };

  if (!capiData.address_in) {
    // Clean up the orphaned payment row
    await admin.from("crypto_payments").delete().eq("id", payment.id);
    return NextResponse.json({ error: "cryptapi_error", detail: capiData }, { status: 502 });
  }

  // Update payment with address_in
  await admin.from("crypto_payments").update({ address_in: capiData.address_in }).eq("id", payment.id);

  return NextResponse.json({
    paymentId: payment.id,
    addressIn: capiData.address_in,
    coinAmount: expectedCoin,
    coinLabel: COIN_LABELS[coin],
    amountEur,
    plan,
    coin,
    expiresAt: payment.expires_at,
  });
}
