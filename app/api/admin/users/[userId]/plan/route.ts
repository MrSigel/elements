import { NextRequest, NextResponse } from "next/server";
import { isValidAdminToken } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase/server";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const adminToken = req.cookies.get("admin-token")?.value;
  if (!isValidAdminToken(adminToken)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { userId } = await params;

  let body: { plan: string; durationDays?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { plan, durationDays } = body;
  if (!["starter", "pro", "enterprise"].includes(plan)) {
    return NextResponse.json({ error: "invalid_plan" }, { status: 400 });
  }

  const admin = createServiceClient();
  const { data: channel } = await admin
    .from("channels")
    .select("id")
    .eq("owner_id", userId)
    .limit(1)
    .maybeSingle();

  if (!channel) {
    return NextResponse.json({ error: "channel_not_found" }, { status: 404 });
  }

  const expiresAt =
    plan !== "starter" && durationDays
      ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString()
      : plan === "starter"
      ? null
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await admin
    .from("channels")
    .update({
      subscription_plan: plan,
      subscription_expires_at: expiresAt
    })
    .eq("id", channel.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, plan, expiresAt });
}
