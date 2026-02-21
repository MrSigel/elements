import net from "net";
import { createServiceClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

type BotAuth = {
  login: string;
  accessToken: string;
};

async function refreshTwitchTokenIfNeeded(userId: string) {
  const admin = createServiceClient();
  const { data: user } = await admin
    .from("users")
    .select("twitch_access_token,twitch_refresh_token,twitch_token_expires_at,twitch_token_scope")
    .eq("id", userId)
    .maybeSingle();

  const accessToken = user?.twitch_access_token?.trim();
  const refreshToken = user?.twitch_refresh_token?.trim();
  const expiresAt = user?.twitch_token_expires_at ? new Date(user.twitch_token_expires_at).getTime() : 0;

  if (accessToken && expiresAt > Date.now() + 60_000) {
    return { accessToken, refreshToken: refreshToken ?? null };
  }
  if (!refreshToken) return { accessToken: accessToken ?? "", refreshToken: null };

  const tokenRes = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.TWITCH_CLIENT_ID,
      client_secret: env.TWITCH_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: refreshToken
    })
  });

  if (!tokenRes.ok) return { accessToken: accessToken ?? "", refreshToken };
  const refreshed = (await tokenRes.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    scope?: string[];
  };
  if (!refreshed.access_token) return { accessToken: accessToken ?? "", refreshToken };

  const newExpiresAt = refreshed.expires_in ? new Date(Date.now() + refreshed.expires_in * 1000).toISOString() : null;
  await admin.from("users").update({
    twitch_access_token: refreshed.access_token,
    twitch_refresh_token: refreshed.refresh_token ?? refreshToken,
    twitch_token_expires_at: newExpiresAt,
    twitch_token_scope: refreshed.scope ?? user?.twitch_token_scope ?? null
  }).eq("id", userId);

  return { accessToken: refreshed.access_token, refreshToken: refreshed.refresh_token ?? refreshToken };
}

async function resolveBotAuthForChannel(channelLogin: string): Promise<BotAuth | null> {
  const admin = createServiceClient();
  const { data: channel } = await admin.from("channels").select("owner_id,slug").eq("slug", channelLogin).maybeSingle();
  if (!channel?.owner_id) return null;

  const { data: owner } = await admin
    .from("users")
    .select("twitch_login")
    .eq("id", channel.owner_id)
    .maybeSingle();

  const login = owner?.twitch_login?.trim();
  const refreshed = await refreshTwitchTokenIfNeeded(channel.owner_id);
  const accessToken = refreshed.accessToken?.trim();
  if (!login || !accessToken) return null;
  return { login, accessToken };
}

export async function startTwitchGuessBot(channelLogin: string, bonushuntId: string) {
  const auth = await resolveBotAuthForChannel(channelLogin);
  if (!auth) return () => undefined;

  const socket = net.createConnection(6667, "irc.chat.twitch.tv");
  const admin = createServiceClient();

  socket.write(`PASS oauth:${auth.accessToken}\r\n`);
  socket.write(`NICK ${auth.login}\r\n`);
  socket.write(`JOIN #${channelLogin}\r\n`);

  socket.on("data", async (chunk) => {
    const text = chunk.toString("utf8");
    if (text.includes("PING :tmi.twitch.tv")) {
      socket.write("PONG :tmi.twitch.tv\r\n");
      return;
    }

    const match = text.match(/:(.+)!.+ PRIVMSG #.+ :!guess\s+([0-9]+(\.[0-9]+)?)/i);
    if (!match) return;

    const twitchUserId = match[1].toLowerCase();
    const value = Number(match[2]);
    if (!Number.isFinite(value)) return;

    await admin.from("guesses").upsert({
      bonushunt_id: bonushuntId,
      twitch_user_id: twitchUserId,
      value
    }, { onConflict: "bonushunt_id,twitch_user_id" });
  });

  return () => socket.end();
}

