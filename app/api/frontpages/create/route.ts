import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { frontpageCreateSchema } from "@/lib/schemas/overlay";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import { AuthzError, getOverlayChannelId, requireChannelPermission } from "@/lib/authz";

export async function POST(req: NextRequest) {
  const parsed = frontpageCreateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const userClient = createServerClient();
  const { data: auth } = await userClient.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const channelId = await getOverlayChannelId(parsed.data.overlayId);
    await requireChannelPermission({ userId: auth.user.id, channelId, permissionKey: "frontpage_manage", overlayId: parsed.data.overlayId });

    const admin = createServiceClient();
    const { data: page, error } = await admin.from("viewer_pages").upsert({ overlay_id: parsed.data.overlayId, channel_id: channelId, page_type: parsed.data.pageType, enabled: parsed.data.enabled }, { onConflict: "overlay_id,page_type" }).select("id").single();
    if (error || !page) return NextResponse.json({ error: error?.message ?? "create_failed" }, { status: 400 });

    const token = crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
    await admin.from("viewer_tokens").upsert({ viewer_page_id: page.id, public_token: token, revoked: false }, { onConflict: "viewer_page_id" });
    return NextResponse.json({ viewerPageId: page.id, token });
  } catch (error) {
    if (error instanceof AuthzError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "failed" }, { status: 400 });
  }
}


