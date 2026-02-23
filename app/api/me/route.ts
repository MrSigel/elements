import { NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const userClient = await createServerClient();
  const { data: auth } = await userClient.auth.getUser();
  if (!auth.user) return NextResponse.json({ twitchLogin: null, twitchDisplayName: null });

  const admin = createServiceClient();
  const { data: user } = await admin
    .from("users")
    .select("twitch_login,twitch_display_name")
    .eq("id", auth.user.id)
    .maybeSingle();

  return NextResponse.json({
    twitchLogin: user?.twitch_login ?? null,
    twitchDisplayName: user?.twitch_display_name ?? null
  });
}
