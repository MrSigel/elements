type TelegramSendResponse = {
  ok: boolean;
  result?: {
    message_id: number;
    chat?: { id?: number };
    text?: string;
  };
};

type TelegramUpdate = {
  update_id: number;
  message?: {
    message_id: number;
    text?: string;
    date?: number;
    from?: { is_bot?: boolean };
    reply_to_message?: { message_id?: number };
    chat?: { id?: number };
  };
};

function getTelegramConfig() {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim() || "";
  const chatId = process.env.TELEGRAM_LIVECHAT_ID?.trim() || "";
  return { token, chatId };
}

export function hasTelegramLivechatConfig() {
  const cfg = getTelegramConfig();
  return Boolean(cfg.token && cfg.chatId);
}

async function telegramRequest<T>(method: string, body?: Record<string, unknown>): Promise<T> {
  const { token } = getTelegramConfig();
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
    cache: "no-store"
  });
  const data = (await res.json().catch(() => null)) as { ok?: boolean; description?: string } & T;
  if (!res.ok || !data || data.ok === false) {
    const description = data?.description || `telegram_http_${res.status}`;
    throw new Error(`telegram_api_error:${description}`);
  }
  return data as T;
}

export async function sendTelegramLivechatMessage(text: string) {
  const { chatId } = getTelegramConfig();
  const payload = await telegramRequest<TelegramSendResponse>("sendMessage", {
    chat_id: chatId,
    text,
    disable_web_page_preview: true
  });
  return payload.result?.message_id ?? null;
}

export async function fetchTelegramUpdates(offset: number) {
  const payload = await telegramRequest<{ ok: boolean; result?: TelegramUpdate[] }>("getUpdates", {
    offset,
    limit: 100,
    timeout: 0,
    allowed_updates: ["message"]
  });
  return payload.result ?? [];
}

