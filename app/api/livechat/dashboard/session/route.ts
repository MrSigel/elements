import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import { ensureDiscordThreadForSession, hasDiscordLivechatConfig } from "@/lib/discord-livechat";

export async function POST() {
  const userClient = await createServerClient();
  const { data: auth } = await userClient.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const admin = createServiceClient();
  const { data: channel } = await admin.from("channels").select("id,slug,title").eq("owner_id", auth.user.id).limit(1).maybeSingle();
  if (!channel) return NextResponse.json({ error: "channel_not_found" }, { status: 404 });

  const sessionToken = crypto.randomBytes(24).toString("hex");
  const { data: session, error } = await admin
    .from("livechat_sessions")
    .insert({
      channel_id: channel.id,
      channel_slug: channel.slug,
      session_token: sessionToken,
      visitor_name: channel.title || channel.slug
    })
    .select("id,channel_slug,visitor_name,discord_thread_id")
    .single();
  if (error || !session) return NextResponse.json({ error: "create_session_failed" }, { status: 500 });

  let discordStatus: "connected" | "degraded" = "degraded";
  if (hasDiscordLivechatConfig()) {
    try {
      const threadId = await ensureDiscordThreadForSession({
        sessionId: session.id,
        channelSlug: session.channel_slug,
        visitorName: session.visitor_name,
        existingThreadId: session.discord_thread_id
      });
      if (threadId) {
        await admin.from("livechat_sessions").update({ discord_thread_id: threadId, updated_at: new Date().toISOString() }).eq("id", session.id);
        discordStatus = "connected";
      }
    } catch {
      discordStatus = "degraded";
    }
  }

  await admin.from("livechat_messages").insert({
    session_id: session.id,
    sender: "system",
    body: "Welcome to Pulseframelabs' live chat. We are happy to assist you and usually respond within minutes during German business hours: 8:00 a.m. to 7:00 p.m."
  });

  return NextResponse.json({ sessionId: session.id, sessionToken, discordStatus });
}
