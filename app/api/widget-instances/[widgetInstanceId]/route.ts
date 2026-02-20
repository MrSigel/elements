import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import { AuthzError, requireChannelPermission } from "@/lib/authz";

async function widgetChannel(widgetInstanceId: string) {
  const admin = createServiceClient();
  const { data } = await admin.from("widget_instances").select("id,overlay_id,overlays!inner(channel_id)").eq("id", widgetInstanceId).single();
  if (!data) throw new AuthzError("widget_not_found", 404);
  return { channelId: (data.overlays as { channel_id: string }).channel_id, overlayId: data.overlay_id };
}

export async function PATCH(req: NextRequest, { params }: { params: { widgetInstanceId: string } }) {
  const body = await req.json();
  const userClient = createServerClient();
  const { data: auth } = await userClient.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const ctx = await widgetChannel(params.widgetInstanceId);
    await requireChannelPermission({ userId: auth.user.id, channelId: ctx.channelId, permissionKey: "widget_manage", overlayId: ctx.overlayId, widgetInstanceId: params.widgetInstanceId });
    const admin = createServiceClient();
    const { error } = await admin.from("widget_instances").update(body).eq("id", params.widgetInstanceId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthzError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "failed" }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { widgetInstanceId: string } }) {
  const userClient = createServerClient();
  const { data: auth } = await userClient.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const ctx = await widgetChannel(params.widgetInstanceId);
    await requireChannelPermission({ userId: auth.user.id, channelId: ctx.channelId, permissionKey: "widget_manage", overlayId: ctx.overlayId, widgetInstanceId: params.widgetInstanceId });
    const admin = createServiceClient();
    const { error } = await admin.from("widget_instances").delete().eq("id", params.widgetInstanceId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthzError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "failed" }, { status: 400 });
  }
}

