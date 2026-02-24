/**
 * Next.js Instrumentation Hook — runs once when the server process starts.
 * Restarts all bots whose bot_active=true in the DB, so the bot survives
 * deploys and server restarts without waiting for a cron job.
 */
export async function register() {
  // Only run in the Node.js runtime (not in the Edge runtime)
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  try {
    const { createServiceClient } = await import("@/lib/supabase/server");
    const { ensureBotStarted } = await import("@/lib/twitch/bot");

    const admin = createServiceClient();
    const { data: channels } = await admin
      .from("channels")
      .select("slug")
      .eq("bot_active", true);

    for (const ch of (channels ?? [])) {
      try {
        await ensureBotStarted(ch.slug as string);
        console.log(`[instrumentation] bot started for: ${String(ch.slug)}`);
      } catch (err) {
        console.error(`[instrumentation] failed to start bot for ${String(ch.slug)}:`, err);
      }
    }
  } catch (err) {
    console.error("[instrumentation] error during bot startup:", err);
  }
}
