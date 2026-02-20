import { NextRequest, NextResponse } from "next/server";
import { modInviteSchema } from "@/lib/schemas/overlay";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import { AuthzError, requireChannelPermission } from "@/lib/authz";

export async function POST(req: NextRequest) {
  const parsed = modInviteSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const userClient = createServerClient();
  const { data: auth } = await userClient.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    await requireChannelPermission({ userId: auth.user.id, channelId: parsed.data.channelId, permissionKey: "mod_manage" });

    const admin = createServiceClient();
    const { data: user } = await admin.from("users").select("id").ilike("twitch_login", parsed.data.twitchLogin).single();
    if (!user) return NextResponse.json({ error: "target_user_not_found" }, { status: 404 });

    const { error } = await admin.from("channel_roles").upsert({ channel_id: parsed.data.channelId, user_id: user.id, role: "moderator" }, { onConflict: "channel_id,user_id" });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthzError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "failed" }, { status: 400 });
  }
}
