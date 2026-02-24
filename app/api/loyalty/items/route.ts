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
    .from("loyalty_items")
    .select("id,name,cost,cooldown_secs,created_at")
    .eq("channel_id", channelId)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ items: data ?? [] });
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
  const cooldown_secs = Math.max(0, Math.floor(Number(body.cooldown_secs) || 0));

  const admin = createServiceClient();
  const { data, error } = await admin
    .from("loyalty_items")
    .insert({ channel_id: channelId, name, cost, cooldown_secs })
    .select("id,name,cost,cooldown_secs,created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ item: data });
}
