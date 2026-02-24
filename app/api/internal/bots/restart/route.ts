import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { ensureBotStarted } from "@/lib/twitch/bot";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createServiceClient();

  // Start all channels that either have bot_active=true OR have a valid
  // Twitch access token (so the bot restarts even if bot_active was never set).
  const { data: channels } = await admin
    .from("channels")
    .select("slug, owner_id, bot_active, users!inner(twitch_access_token)")
    .not("users.twitch_access_token", "is", null);

  const results: { slug: string; ok: boolean; reason?: string }[] = [];

  for (const ch of channels ?? []) {
    const slug = ch.slug as string;
    try {
      await ensureBotStarted(slug);
      // Mark active in DB so next restart knows to include it
      await admin.from("channels").update({ bot_active: true }).eq("slug", slug);
      results.push({ slug, ok: true });
    } catch (err) {
      results.push({ slug, ok: false, reason: String(err) });
    }
  }

  return NextResponse.json({ restarted: results, count: results.length });
}
