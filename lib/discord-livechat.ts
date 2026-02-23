type DiscordCreateMessageResponse = {
  id: string;
};

type DiscordThreadMessage = {
  id: string;
  content: string;
  author?: { bot?: boolean; username?: string };
  timestamp?: string;
};

function getDiscordConfig() {
  const token = process.env.DISCORD_BOT_TOKEN?.trim();
  const channelId = process.env.DISCORD_LIVECHAT_CHANNEL_ID?.trim();
  return {
    token: token || "",
    channelId: channelId || ""
  };
}

function hasDiscordLivechatConfig() {
  const cfg = getDiscordConfig();
  return Boolean(cfg.token && cfg.channelId);
}

async function discordRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const { token } = getDiscordConfig();
  const res = await fetch(`https://discord.com/api/v10${path}`, {
    ...init,
    headers: {
      Authorization: `Bot ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers || {})
    },
    cache: "no-store"
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "discord_request_failed");
    throw new Error(`discord_api_${res.status}:${msg}`);
  }
  return (await res.json()) as T;
}

export async function ensureDiscordThreadForSession(params: {
  sessionId: string;
  channelSlug: string;
  visitorName: string;
  existingThreadId?: string | null;
}) {
  if (params.existingThreadId) return params.existingThreadId;
  if (!hasDiscordLivechatConfig()) return null;

  const { channelId } = getDiscordConfig();
  const starter = await discordRequest<DiscordCreateMessageResponse>(`/channels/${channelId}/messages`, {
    method: "POST",
    body: JSON.stringify({
      content: `New livechat from /c/${params.channelSlug} | Visitor: ${params.visitorName} | Session: ${params.sessionId}`
    })
  });

  const thread = await discordRequest<DiscordCreateMessageResponse>(
    `/channels/${channelId}/messages/${starter.id}/threads`,
    {
      method: "POST",
      body: JSON.stringify({
        name: `Livechat ${params.channelSlug} ${params.sessionId.slice(0, 8)}`,
        auto_archive_duration: 1440
      })
    }
  );

  await sendMessageToDiscordThread(
    thread.id,
    `Thread connected. Reply here and your messages appear in the website chat window.`
  );
  return thread.id;
}

export async function sendMessageToDiscordThread(threadId: string, content: string) {
  if (!hasDiscordLivechatConfig()) return null;
  return discordRequest<DiscordCreateMessageResponse>(`/channels/${threadId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content })
  });
}

export async function listDiscordThreadMessages(threadId: string, afterMessageId?: string | null) {
  if (!hasDiscordLivechatConfig()) return [] as DiscordThreadMessage[];
  const qs = afterMessageId ? `?after=${encodeURIComponent(afterMessageId)}&limit=100` : "?limit=100";
  return discordRequest<DiscordThreadMessage[]>(`/channels/${threadId}/messages${qs}`);
}

