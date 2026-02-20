import { NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import { AuthzError, getOverlayChannelId, requireChannelPermission } from "@/lib/authz";

export async function POST(_: Request, { params }: { params: { overlayId: string } }) {
  const userClient = createServerClient();
  const { data: auth } = await userClient.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const channelId = await getOverlayChannelId(params.overlayId);
    await requireChannelPermission({ userId: auth.user.id, channelId, permissionKey: "overlay_token_revoke", overlayId: params.overlayId });

    const admin = createServiceClient();
    const { error } = await admin.from("overlay_tokens").update({ revoked: true }).eq("overlay_id", params.overlayId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthzError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "failed" }, { status: 400 });
  }
}
