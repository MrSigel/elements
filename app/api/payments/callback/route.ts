import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

const OK = new NextResponse("*ok*", { status: 200, headers: { "content-type": "text/plain" } });

export async function POST(req: NextRequest) {
  // Always respond *ok* — CryptAPI retries exponentially on any other response,
  // so we swallow errors silently and log them instead.
  try {
    const secret = req.nextUrl.searchParams.get("secret");
    const paymentId = req.nextUrl.searchParams.get("payment_id");

    if (!secret || secret !== env.CRYPTAPI_WEBHOOK_SECRET || !paymentId) return OK;

    const body = await req.json().catch(() => null) as {
      uuid?: string;
      value_coin?: string | number;
      pending?: string | number;
      txid_in?: string;
    } | null;

    if (!body) return OK;

    const admin = createServiceClient();
    const { data: payment } = await admin
      .from("crypto_payments")
      .select("id, channel_id, plan, expected_coin, status, capi_uuid")
      .eq("id", paymentId)
      .single();

    if (!payment) return OK;

    // Idempotency — if already confirmed, nothing to do
    if (payment.capi_uuid) return OK;

    const pending = Number(body.pending);
    const valueCoin = Number(body.value_coin ?? 0);

    if (pending === 0 && valueCoin >= Number(payment.expected_coin) * 0.98) {
      // Confirmed payment — activate subscription
      await admin.from("crypto_payments").update({
        status: "confirmed",
        capi_uuid: body.uuid ?? null,
        value_coin: valueCoin,
        txid: body.txid_in ?? null,
        confirmed_at: new Date().toISOString(),
      }).eq("id", payment.id);

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await admin.from("channels").update({
        subscription_plan: payment.plan,
        subscription_status: "active",
        subscription_expires_at: expiresAt.toISOString(),
      }).eq("id", payment.channel_id);
    } else if (pending === 1) {
      // Pending transaction detected — update status so UI can show "Detected"
      await admin.from("crypto_payments").update({
        capi_uuid: body.uuid ?? null,
      }).eq("id", payment.id).eq("capi_uuid" as never, null as never);
    }
  } catch {
    // Swallow all errors — we must return *ok* to prevent CryptAPI from flooding retries
  }

  return OK;
}
