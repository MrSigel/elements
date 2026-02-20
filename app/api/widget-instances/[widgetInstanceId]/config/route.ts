import { NextRequest, NextResponse } from "next/server";
import { widgetConfigUpsertSchema } from "@/lib/schemas/overlay";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import { AuthzError, requireChannelPermission } from "@/lib/authz";

async function widgetChannel(widgetInstanceId: string) {
  const admin = createServiceClient();
  const { data } = await admin.from("widget_instances").select("id,overlay_id,overlays!inner(channel_id)").eq("id", widgetInstanceId).single();
  if (!data) throw new AuthzError("widget_not_found", 404);
  const overlayRel = Array.isArray(data.overlays) ? data.overlays[0] : data.overlays;
  if (!overlayRel) throw new AuthzError("overlay_not_found", 404);
  return { channelId: overlayRel.channel_id as string, overlayId: data.overlay_id };
}

export async function PUT(req: NextRequest, { params }: any) {
  const parsed = widgetConfigUpsertSchema.safeParse({ ...(await req.json()), widgetInstanceId: params.widgetInstanceId });
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const userClient = createServerClient();
  const { data: auth } = await userClient.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const ctx = await widgetChannel(params.widgetInstanceId);
    await requireChannelPermission({ userId: auth.user.id, channelId: ctx.channelId, permissionKey: "widget_manage", overlayId: ctx.overlayId, widgetInstanceId: params.widgetInstanceId });

    const admin = createServiceClient();
    const { error } = await admin.from("widget_configs").upsert({ widget_instance_id: params.widgetInstanceId, config: parsed.data.config, updated_at: new Date().toISOString() }, { onConflict: "widget_instance_id" });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthzError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "failed" }, { status: 400 });
  }
}
