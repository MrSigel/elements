import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { publishOverlaySchema } from "@/lib/schemas/overlay";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import { AuthzError, getOverlayChannelId, requireChannelPermission } from "@/lib/authz";

export async function POST(req: NextRequest, { params }: any) {
  const parsed = publishOverlaySchema.safeParse({ ...(await req.json()), overlayId: params.overlayId });
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const client = createServerClient();
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const channelId = await getOverlayChannelId(params.overlayId);
    await requireChannelPermission({ userId: auth.user.id, channelId, permissionKey: "overlay_publish", overlayId: params.overlayId });

    const admin = createServiceClient();
    await admin.from("overlays").update({ is_published: parsed.data.published }).eq("id", params.overlayId);
    if (parsed.data.published) {
      const token = crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
      await admin.from("overlay_tokens").upsert({ overlay_id: params.overlayId, public_token: token, revoked: false }, { onConflict: "overlay_id" });
    }

    await admin.from("audit_logs").insert({
      channel_id: channelId,
      actor_id: auth.user.id,
      action: parsed.data.published ? "overlay_published" : "overlay_unpublished",
      metadata: { overlay_id: params.overlayId }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthzError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "failed" }, { status: 400 });
  }
}


