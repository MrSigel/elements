import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

async function getChannelId(userId: string): Promise<string | null> {
  const admin = createServiceClient();
  const { data } = await admin.from("channels").select("id").eq("owner_id", userId).limit(1).maybeSingle();
  return data?.id ?? null;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params;
  const userClient = await createServerClient();
  const { data: auth } = await userClient.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const channelId = await getChannelId(auth.user.id);
  if (!channelId) return NextResponse.json({ error: "channel_not_found" }, { status: 404 });

  const admin = createServiceClient();
  const { data: item } = await admin.from("store_items").select("channel_id").eq("id", itemId).maybeSingle();
  if (!item || item.channel_id !== channelId) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const body = await req.json().catch(() => ({})) as { name?: string; cost?: number; cooldown_secs?: number };
  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (!name) return NextResponse.json({ error: "name_required" }, { status: 400 });
    updates.name = name;
  }
  if (body.cost !== undefined) updates.cost = Math.max(1, Math.floor(Number(body.cost)));
  if (body.cooldown_secs !== undefined) updates.cooldown_seconds = Math.max(0, Math.floor(Number(body.cooldown_secs)));

  const { error } = await admin.from("store_items").update(updates).eq("id", itemId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params;
  const userClient = await createServerClient();
  const { data: auth } = await userClient.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const channelId = await getChannelId(auth.user.id);
  if (!channelId) return NextResponse.json({ error: "channel_not_found" }, { status: 404 });

  const admin = createServiceClient();
  const { data: item } = await admin.from("store_items").select("channel_id").eq("id", itemId).maybeSingle();
  if (!item || item.channel_id !== channelId) return NextResponse.json({ error: "not_found" }, { status: 404 });

  // Soft-delete: mark inactive so existing redemptions remain intact
  const { error } = await admin.from("store_items").update({ is_active: false }).eq("id", itemId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
