import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { listDiscordThreadMessages, sendMessageToDiscordThread } from "@/lib/discord-livechat";

async function getSession(req: NextRequest, admin: ReturnType<typeof createServiceClient>) {
  const sessionId = req.nextUrl.searchParams.get("sessionId") || "";
  const sessionToken = req.nextUrl.searchParams.get("sessionToken") || "";
  if (!sessionId || !sessionToken) return null;

  const { data } = await admin
    .from("livechat_sessions")
    .select("id,session_token,discord_thread_id,last_discord_message_id")
    .eq("id", sessionId)
    .maybeSingle();
  if (!data || data.session_token !== sessionToken) return null;
  return data;
}

export async function GET(req: NextRequest) {
  const admin = createServiceClient();
  const session = await getSession(req, admin);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const syncDiscord = req.nextUrl.searchParams.get("sync") === "1";

  if (syncDiscord && session.discord_thread_id) {
    try {
      const discordMessages = await listDiscordThreadMessages(session.discord_thread_id, session.last_discord_message_id);
      const nonBot = discordMessages
        .filter((m) => m.content?.trim() && !m.author?.bot)
        .sort((a, b) => {
          const av = BigInt(a.id);
          const bv = BigInt(b.id);
          return av < bv ? -1 : av > bv ? 1 : 0;
        });
      if (nonBot.length > 0) {
        const inserts = nonBot.map((m) => ({
          session_id: session.id,
          sender: "agent" as const,
          body: m.content.trim().slice(0, 1000),
          discord_message_id: m.id,
          created_at: m.timestamp ? new Date(m.timestamp).toISOString() : new Date().toISOString()
        }));
        await admin.from("livechat_messages").upsert(inserts, { onConflict: "discord_message_id", ignoreDuplicates: true });
        const latestMessageId = nonBot[nonBot.length - 1]?.id;
        if (latestMessageId) {
          await admin
            .from("livechat_sessions")
            .update({ last_discord_message_id: latestMessageId, updated_at: new Date().toISOString() })
            .eq("id", session.id);
        }
      }
    } catch {
      // Keep widget responsive even if Discord API fails temporarily.
    }
  }

  const { data: messages } = await admin
    .from("livechat_messages")
    .select("id,sender,body,created_at")
    .eq("session_id", session.id)
    .order("created_at", { ascending: true })
    .limit(100);

  return NextResponse.json({ messages: messages ?? [] });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { sessionId?: string; sessionToken?: string; message?: string } | null;
  const sessionId = body?.sessionId?.trim();
  const sessionToken = body?.sessionToken?.trim();
  const message = body?.message?.trim();
  if (!sessionId || !sessionToken || !message) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  if (message.length > 1000) return NextResponse.json({ error: "message_too_long" }, { status: 400 });

  const admin = createServiceClient();
  const { data: session } = await admin
    .from("livechat_sessions")
    .select("id,session_token,discord_thread_id")
    .eq("id", sessionId)
    .maybeSingle();
  if (!session || session.session_token !== sessionToken) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: inserted, error } = await admin
    .from("livechat_messages")
    .insert({
      session_id: session.id,
      sender: "viewer",
      body: message
    })
    .select("id,sender,body,created_at")
    .single();
  if (error || !inserted) return NextResponse.json({ error: "insert_failed" }, { status: 500 });

  if (!session.discord_thread_id) {
    return NextResponse.json({ error: "discord_thread_missing" }, { status: 500 });
  }

  try {
    await sendMessageToDiscordThread(session.discord_thread_id, `Viewer: ${message}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "discord_send_failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  return NextResponse.json({ ok: true, message: inserted });
}
