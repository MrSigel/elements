import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest, { params }: { params: { viewerToken: string } }) {
  const contentType = req.headers.get("content-type") ?? "";
  let value = 0;
  if (contentType.includes("application/x-www-form-urlencoded")) {
    const form = await req.formData();
    value = Number(form.get("value") ?? 0);
  } else {
    const body = await req.json();
    value = Number(body.value ?? 0);
  }
  if (!Number.isFinite(value) || value <= 0) return NextResponse.json({ error: "invalid_value" }, { status: 400 });

  const viewerId = req.headers.get("x-viewer-id") ?? "anon";
  const admin = createServiceClient();
  const { data: token } = await admin
    .from("viewer_tokens")
    .select("viewer_pages!inner(id,page_type,enabled,overlay_id,channel_id)")
    .eq("public_token", params.viewerToken)
    .eq("revoked", false)
    .single();

  if (!token) return NextResponse.json({ error: "invalid_token" }, { status: 404 });
  const page = token.viewer_pages as { page_type: string; enabled: boolean; overlay_id: string; channel_id: string };
  if (!page.enabled || page.page_type !== "bonushunt") return NextResponse.json({ error: "disabled" }, { status: 403 });

  const { data: banned } = await admin.from("viewer_blacklist").select("id").eq("channel_id", page.channel_id).eq("viewer_id", viewerId).maybeSingle();
  if (banned) return NextResponse.json({ error: "blocked" }, { status: 403 });

  const now = new Date();
  const { data: cooldown } = await admin.from("viewer_cooldowns").select("cooldown_until").eq("channel_id", page.channel_id).eq("viewer_id", viewerId).eq("action", "bonushunt_guess_submit").maybeSingle();
  if (cooldown && new Date(cooldown.cooldown_until).getTime() > now.getTime()) return NextResponse.json({ error: "cooldown_active" }, { status: 429 });

  const minute = new Date();
  minute.setSeconds(0, 0);
  const { count } = await admin.from("rate_limits").select("id", { count: "exact", head: true }).eq("scope", "viewer_guess").eq("scope_id", viewerId).eq("action", page.channel_id).eq("window_start", minute.toISOString());
  if ((count ?? 0) >= 2) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  await admin.from("rate_limits").insert({ scope: "viewer_guess", scope_id: viewerId, action: page.channel_id, window_start: minute.toISOString(), hit_count: 1 });
  const { data: hunt } = await admin.from("bonushunts").select("id").eq("overlay_id", page.overlay_id).order("updated_at", { ascending: false }).limit(1).maybeSingle();
  if (!hunt) return NextResponse.json({ error: "bonushunt_not_found" }, { status: 404 });

  const { error } = await admin.from("guesses").upsert({ bonushunt_id: hunt.id, twitch_user_id: viewerId, value }, { onConflict: "bonushunt_id,twitch_user_id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const cooldownUntil = new Date(now.getTime() + 20_000).toISOString();
  await admin.from("viewer_cooldowns").upsert({ channel_id: page.channel_id, viewer_id: viewerId, action: "bonushunt_guess_submit", cooldown_until: cooldownUntil }, { onConflict: "channel_id,viewer_id,action" });

  return NextResponse.redirect(new URL(`/v/${params.viewerToken}/bonushunt`, req.url));
}
