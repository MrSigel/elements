import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import { hasTelegramLivechatConfig, sendTelegramLivechatMessage } from "@/lib/telegram-livechat";

export async function POST() {
  if (!hasTelegramLivechatConfig()) {
    return NextResponse.json({ error: "telegram_not_configured" }, { status: 500 });
  }

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
    .select("id,channel_slug,visitor_name")
    .single();
  if (error || !session) return NextResponse.json({ error: "create_session_failed" }, { status: 500 });

  await admin.from("livechat_messages").insert({
    session_id: session.id,
    sender: "system",
    body: "Welcome to Pulseframelabs' live chat. We are happy to assist you and usually respond within minutes during German business hours: 8:00 a.m. to 7:00 p.m."
  });

  // Telegram bridge is optional — failure must not block the user from opening chat
  let bridge = "none";
  try {
    const msgId = await sendTelegramLivechatMessage(
      `New Livechat Session\nSession: ${session.id}\nChannel: ${session.channel_slug}\nVisitor: ${session.visitor_name}\n\nReply to visitor messages in this chat or use:\n/reply ${session.id} your message`
    );
    if (msgId !== null) {
      await admin.from("livechat_messages").insert({
        session_id: session.id,
        sender: "system",
        body: "Telegram bridge connected.",
        telegram_message_id: `tg:${msgId}`
      });
      bridge = "telegram";
    }
  } catch {
    // Telegram notification failed — session is still valid; swallow silently
  }

  return NextResponse.json({ sessionId: session.id, sessionToken, bridge });
}

