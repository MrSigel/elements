import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { fetchTelegramUpdates, hasTelegramLivechatConfig, sendTelegramLivechatMessage } from "@/lib/telegram-livechat";

async function getSession(req: NextRequest, admin: ReturnType<typeof createServiceClient>) {
  const sessionId = req.nextUrl.searchParams.get("sessionId") || "";
  const sessionToken = req.nextUrl.searchParams.get("sessionToken") || "";
  if (!sessionId || !sessionToken) return null;

  const { data } = await admin
    .from("livechat_sessions")
    .select("id,session_token,channel_slug")
    .eq("id", sessionId)
    .maybeSingle();
  if (!data || data.session_token !== sessionToken) return null;
  return data;
}

async function syncTelegramReplies(admin: ReturnType<typeof createServiceClient>) {
  if (!hasTelegramLivechatConfig()) return;

  const { data: state } = await admin.from("livechat_runtime_state").select("value_text").eq("key", "telegram_update_offset").maybeSingle();
  const currentOffset = Number.parseInt(state?.value_text ?? "0", 10);
  const safeOffset = Number.isFinite(currentOffset) ? currentOffset : 0;

  const updates = await fetchTelegramUpdates(safeOffset);
  if (!updates.length) return;

  let nextOffset = safeOffset;
  for (const upd of updates) {
    nextOffset = Math.max(nextOffset, upd.update_id + 1);
    const msg = upd.message;
    if (!msg?.text?.trim() || msg.from?.is_bot) continue;

    let targetSessionId: string | null = null;
    const replyToId = msg.reply_to_message?.message_id;
    if (replyToId) {
      const { data: source } = await admin
        .from("livechat_messages")
        .select("session_id")
        .eq("telegram_message_id", `tg:${replyToId}`)
        .limit(1)
        .maybeSingle();
      if (source?.session_id) targetSessionId = source.session_id;
    }

    if (!targetSessionId && msg.text.startsWith("/reply ")) {
      const remainder = msg.text.slice(7).trim();
      const spaceIdx = remainder.indexOf(" ");
      if (spaceIdx > 0) {
        const maybeSessionId = remainder.slice(0, spaceIdx).trim();
        const { data: sessionExists } = await admin.from("livechat_sessions").select("id").eq("id", maybeSessionId).maybeSingle();
        if (sessionExists?.id) {
          targetSessionId = sessionExists.id;
        }
      }
    }

    if (!targetSessionId) continue;

    const agentText = msg.text.startsWith("/reply ")
      ? msg.text.slice(7).trim().split(" ").slice(1).join(" ").trim()
      : msg.text.trim();
    if (!agentText) continue;

    await admin.from("livechat_messages").upsert(
      {
        session_id: targetSessionId,
        sender: "agent",
        body: agentText.slice(0, 1000),
        telegram_message_id: `tg:${msg.message_id}`,
        created_at: msg.date ? new Date(msg.date * 1000).toISOString() : new Date().toISOString()
      },
      { onConflict: "telegram_message_id", ignoreDuplicates: true }
    );
  }

  await admin.from("livechat_runtime_state").upsert(
    {
      key: "telegram_update_offset",
      value_text: String(nextOffset),
      updated_at: new Date().toISOString()
    },
    { onConflict: "key" }
  );
}

export async function GET(req: NextRequest) {
  const admin = createServiceClient();
  const session = await getSession(req, admin);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const syncTelegram = req.nextUrl.searchParams.get("sync") === "1";
  if (syncTelegram) {
    try {
      await syncTelegramReplies(admin);
    } catch {
      // keep the widget responsive even if Telegram API fails temporarily
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
    .select("id,session_token,channel_slug")
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

  if (!hasTelegramLivechatConfig()) {
    return NextResponse.json({ error: "telegram_not_configured" }, { status: 500 });
  }

  try {
    const msgId = await sendTelegramLivechatMessage(
      `Session ${session.id}\nChannel: ${session.channel_slug}\n\nVisitor:\n${message}`
    );
    if (msgId !== null) {
      await admin.from("livechat_messages").update({ telegram_message_id: `tg:${msgId}` }).eq("id", inserted.id);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "telegram_send_failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  return NextResponse.json({ ok: true, delivery: "telegram", message: inserted });
}

