import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import { AuthzError, getOverlayChannelId, requireChannelPermission } from "@/lib/authz";

export async function POST(_: NextRequest, { params }: any) {
  const userClient = createServerClient();
  const { data: auth } = await userClient.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const channelId = await getOverlayChannelId(params.overlayId);
    await requireChannelPermission({ userId: auth.user.id, channelId, permissionKey: "overlay_token_rotate", overlayId: params.overlayId });

    const admin = createServiceClient();
    const token = crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
    const { error } = await admin.from("overlay_tokens").upsert({
      overlay_id: params.overlayId,
      public_token: token,
      revoked: false,
      rotated_at: new Date().toISOString()
    }, { onConflict: "overlay_id" });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ token });
  } catch (error) {
    if (error instanceof AuthzError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "failed" }, { status: 400 });
  }
}


