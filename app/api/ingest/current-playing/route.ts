import { NextRequest, NextResponse } from "next/server";
import { buildIngestSignature } from "@/lib/security";
import { ingestCurrentPlayingSchema } from "@/lib/schemas/overlay";
import { env } from "@/lib/env";
import { createServiceClient } from "@/lib/supabase/server";

function isValidSignature(body: string, incoming: string | null) {
  return incoming === buildIngestSignature(body, env.INGEST_SHARED_SECRET);
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (!isValidSignature(raw, req.headers.get("x-ingest-signature"))) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  const parsed = ingestCurrentPlayingSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const admin = createServiceClient();
  const { data: channel } = await admin.from("channels").select("id").eq("slug", parsed.data.channelSlug).single();
  if (!channel) return NextResponse.json({ error: "channel_not_found" }, { status: 404 });

  await admin.from("current_playing").upsert({
    channel_id: channel.id,
    game_identifier: parsed.data.gameIdentifier,
    game_name: parsed.data.gameName,
    provider: parsed.data.provider,
    updated_at: new Date().toISOString()
  }, { onConflict: "channel_id" });

  return NextResponse.json({ ok: true });
}

