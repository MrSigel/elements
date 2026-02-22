import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { ensureBotStarted } from "@/lib/twitch/bot";

/**
 * GET /api/internal/bots/restart
 *
 * Called by Vercel Cron (every 5 minutes) to restart bots for channels that had
 * bot_active=true. This handles cold starts where the in-memory singleton is lost.
 *
 * Auth: Vercel Cron sends Authorization: Bearer {CRON_SECRET} automatically.
 * For manual calls, pass the same header.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Require auth unless CRON_SECRET is not configured (dev mode)
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createServiceClient();
  const { data: channels } = await admin
    .from("channels")
    .select("slug")
    .eq("bot_active", true);

  const results: { slug: string; ok: boolean }[] = [];

  for (const ch of channels ?? []) {
    try {
      await ensureBotStarted(ch.slug as string);
      results.push({ slug: ch.slug as string, ok: true });
    } catch {
      results.push({ slug: ch.slug as string, ok: false });
    }
  }

  return NextResponse.json({ restarted: results, count: results.length });
}
