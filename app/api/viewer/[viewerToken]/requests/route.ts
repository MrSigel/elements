import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest, { params }: { params: { viewerToken: string } }) {
  const body = await req.json();
  const slotName = String(body.slotName ?? "").trim();
  const userId = req.headers.get("x-viewer-id") ?? "anon";
  if (!slotName) return NextResponse.json({ error: "slot_required" }, { status: 400 });

  const admin = createServiceClient();
  const { data: viewer } = await admin
    .from("viewer_tokens")
    .select("viewer_page_id,viewer_pages!inner(channel_id,enabled,page_type)")
    .eq("public_token", params.viewerToken)
    .eq("revoked", false)
    .single();
  if (!viewer) return NextResponse.json({ error: "invalid_token" }, { status: 404 });

  const page = viewer.viewer_pages as { channel_id: string; enabled: boolean; page_type: string };
  const chId = page.channel_id;

  const { data: banned } = await admin.from("viewer_blacklist").select("id").eq("channel_id", chId).eq("viewer_id", userId).maybeSingle();
  if (banned) return NextResponse.json({ error: "blocked" }, { status: 403 });

  const now = new Date();
  const { data: cooldown } = await admin.from("viewer_cooldowns").select("cooldown_until").eq("channel_id", chId).eq("viewer_id", userId).eq("action", "slot_request_submit").maybeSingle();
  if (cooldown && new Date(cooldown.cooldown_until).getTime() > now.getTime()) {
    return NextResponse.json({ error: "cooldown_active" }, { status: 429 });
  }

  const windowStart = new Date(now.getTime() - 60_000).toISOString();
  const { count } = await admin
    .from("rate_limits")
    .select("id", { count: "exact", head: true })
    .eq("scope", "viewer")
    .eq("scope_id", userId)
    .eq("action", `request:${chId}`)
    .gte("window_start", windowStart);

  if ((count ?? 0) >= 3) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  await admin.from("rate_limits").insert({ scope: "viewer", scope_id: userId, action: `request:${chId}`, window_start: now.toISOString(), hit_count: 1 });

  const { error } = await admin.from("slot_requests").insert({ channel_id: chId, twitch_user_id: userId, slot_name: slotName });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const cooldownUntil = new Date(now.getTime() + 30_000).toISOString();
  await admin.from("viewer_cooldowns").upsert({ channel_id: chId, viewer_id: userId, action: "slot_request_submit", cooldown_until: cooldownUntil }, { onConflict: "channel_id,viewer_id,action" });

  return NextResponse.json({ ok: true });
}

