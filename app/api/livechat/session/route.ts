import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { createServiceClient } from "@/lib/supabase/server";
import { ensureDiscordThreadForSession } from "@/lib/discord-livechat";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { channelSlug?: string; visitorName?: string } | null;
  const channelSlug = body?.channelSlug?.trim().toLowerCase();
  const visitorName = body?.visitorName?.trim().slice(0, 32) || "Guest";
  if (!channelSlug) return NextResponse.json({ error: "missing_channel_slug" }, { status: 400 });

  const admin = createServiceClient();
  const { data: channel } = await admin.from("channels").select("id,slug").eq("slug", channelSlug).maybeSingle();
  if (!channel) return NextResponse.json({ error: "channel_not_found" }, { status: 404 });

  const sessionToken = crypto.randomBytes(24).toString("hex");
  const { data: session, error } = await admin
    .from("livechat_sessions")
    .insert({
      channel_id: channel.id,
      channel_slug: channel.slug,
      session_token: sessionToken,
      visitor_name: visitorName
    })
    .select("id,channel_slug,visitor_name,discord_thread_id")
    .single();

  if (error || !session) {
    return NextResponse.json({ error: "create_session_failed" }, { status: 500 });
  }

  try {
    const threadId = await ensureDiscordThreadForSession({
      sessionId: session.id,
      channelSlug: session.channel_slug,
      visitorName: session.visitor_name,
      existingThreadId: session.discord_thread_id
    });
    if (threadId) {
      await admin.from("livechat_sessions").update({ discord_thread_id: threadId, updated_at: new Date().toISOString() }).eq("id", session.id);
    }
  } catch {
    // Chat still works without Discord when integration is unavailable.
  }

  await admin.from("livechat_messages").insert({
    session_id: session.id,
    sender: "system",
    body: "Support is online. Write your message and we will answer shortly."
  });

  return NextResponse.json({ sessionId: session.id, sessionToken });
}

