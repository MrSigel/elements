import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

async function getChannelId(userId: string): Promise<string | null> {
  const admin = createServiceClient();
  const { data } = await admin.from("channels").select("id").eq("owner_id", userId).limit(1).maybeSingle();
  return data?.id ?? null;
}

export async function GET() {
  const userClient = await createServerClient();
  const { data: auth } = await userClient.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const channelId = await getChannelId(auth.user.id);
  if (!channelId) return NextResponse.json({ error: "channel_not_found" }, { status: 404 });

  const admin = createServiceClient();
  const { data, error } = await admin
    .from("store_items")
    .select("id,name,cost,cooldown_seconds,created_at")
    .eq("channel_id", channelId)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  const items = (data ?? []).map((r) => ({ id: r.id, name: r.name, cost: r.cost, cooldown_secs: r.cooldown_seconds, created_at: r.created_at }));
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const userClient = await createServerClient();
  const { data: auth } = await userClient.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const channelId = await getChannelId(auth.user.id);
  if (!channelId) return NextResponse.json({ error: "channel_not_found" }, { status: 404 });

  const body = await req.json().catch(() => ({})) as { name?: string; cost?: number; cooldown_secs?: number };
  const name = (body.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "name_required" }, { status: 400 });
  const cost = Math.max(1, Math.floor(Number(body.cost) || 100));
  const cooldown_seconds = Math.max(0, Math.floor(Number(body.cooldown_secs) || 0));

  const admin = createServiceClient();
  const { data, error } = await admin
    .from("store_items")
    .insert({ channel_id: channelId, name, cost, cooldown_seconds, is_active: true })
    .select("id,name,cost,cooldown_seconds,created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  const item = { id: data.id, name: data.name, cost: data.cost, cooldown_secs: data.cooldown_seconds, created_at: data.created_at };
  return NextResponse.json({ item });
}
