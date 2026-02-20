import net from "net";
import { createServiceClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

export function startTwitchGuessBot(channelLogin: string, bonushuntId: string) {
  const socket = net.createConnection(6667, "irc.chat.twitch.tv");
  const admin = createServiceClient();

  socket.write(`PASS oauth:${env.TWITCH_BOT_OAUTH_TOKEN}\r\n`);
  socket.write(`NICK ${env.TWITCH_BOT_USERNAME}\r\n`);
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

