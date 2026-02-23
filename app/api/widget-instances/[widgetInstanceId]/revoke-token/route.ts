import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import { AuthzError, getOverlayChannelId, requireChannelPermission } from "@/lib/authz";

async function getWidgetOverlayId(widgetInstanceId: string): Promise<string> {
  const admin = createServiceClient();
  const { data } = await admin
    .from("widget_instances")
    .select("overlay_id")
    .eq("id", widgetInstanceId)
    .maybeSingle();
  if (!data) throw new AuthzError("widget_not_found", 404);
  return data.overlay_id;
}

export async function POST(_: NextRequest, { params }: { params: Promise<{ widgetInstanceId: string }> }) {
  const { widgetInstanceId } = await params;
  const userClient = await createServerClient();
  const { data: auth } = await userClient.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const overlayId = await getWidgetOverlayId(widgetInstanceId);
    const channelId = await getOverlayChannelId(overlayId);
    await requireChannelPermission({ userId: auth.user.id, channelId, permissionKey: "overlay_token_rotate", overlayId });

    const admin = createServiceClient();
    const { error } = await admin
      .from("widget_tokens")
      .update({ revoked: true })
      .eq("widget_instance_id", widgetInstanceId);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthzError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: "failed" }, { status: 400 });
  }
}
