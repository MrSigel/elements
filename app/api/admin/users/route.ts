import { NextRequest, NextResponse } from "next/server";
import { isValidAdminToken } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const adminToken = req.cookies.get("admin-token")?.value;
  if (!isValidAdminToken(adminToken)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createServiceClient();

  // Get all auth users
  const { data: authData, error: authError } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  // Get all channels with plan info
  const { data: channels } = await admin
    .from("channels")
    .select("id,owner_id,slug,title,subscription_plan,subscription_expires_at,created_at");

  // Get overlay counts per channel
  const { data: overlayCounts } = await admin
    .from("overlays")
    .select("channel_id");

  // Get users table for twitch info
  const { data: usersTable } = await admin
    .from("users")
    .select("id,twitch_login,twitch_display_name");

  const channelMap = new Map((channels ?? []).map((c) => [c.owner_id as string, c]));
  const twitchMap = new Map((usersTable ?? []).map((u) => [u.id as string, u]));

  const overlayCountMap = new Map<string, number>();
  for (const row of overlayCounts ?? []) {
    const cid = row.channel_id as string;
    overlayCountMap.set(cid, (overlayCountMap.get(cid) ?? 0) + 1);
  }

  const users = (authData.users ?? []).map((u) => {
    const channel = channelMap.get(u.id);
    const twitch = twitchMap.get(u.id);
    const overlays = channel ? (overlayCountMap.get(channel.id as string) ?? 0) : 0;
    const expired =
      channel?.subscription_expires_at &&
      new Date(channel.subscription_expires_at as string) < new Date();
    const plan = expired ? "starter" : ((channel?.subscription_plan as string) ?? "starter");

    return {
      id: u.id,
      email: u.email ?? "",
      createdAt: u.created_at,
      twitchLogin: (twitch?.twitch_login as string) ?? null,
      twitchDisplayName: (twitch?.twitch_display_name as string) ?? null,
      channelId: (channel?.id as string) ?? null,
      channelSlug: (channel?.slug as string) ?? null,
      plan,
      subscriptionExpiresAt: (channel?.subscription_expires_at as string) ?? null,
      overlayCount: overlays
    };
  });

  // Sort newest first
  users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json({ users });
}
