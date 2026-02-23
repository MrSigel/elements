import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

export async function GET(_: NextRequest, { params }: { params: Promise<{ paymentId: string }> }) {
  const { paymentId } = await params;
  const userClient = await createServerClient();
  const { data: auth } = await userClient.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const admin = createServiceClient();

  // Load payment + verify it belongs to the user's channel
  const { data: payment } = await admin
    .from("crypto_payments")
    .select("id, plan, coin, amount_eur, expected_coin, address_in, status, confirmed_at, expires_at, channels!inner(owner_id)")
    .eq("id", paymentId)
    .single();

  if (!payment) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const channel = Array.isArray(payment.channels) ? payment.channels[0] : payment.channels;
  if (channel?.owner_id !== auth.user.id) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  return NextResponse.json({
    id: payment.id,
    plan: payment.plan,
    coin: payment.coin,
    amountEur: payment.amount_eur,
    coinAmount: payment.expected_coin,
    addressIn: payment.address_in,
    status: payment.status,
    confirmedAt: payment.confirmed_at,
    expiresAt: payment.expires_at,
  });
}
