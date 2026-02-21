import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const userClient = await createServerClient();
  const { data: auth } = await userClient.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json();
  const channelRoleId = String(body.channelRoleId ?? "");
  const permissionKey = String(body.permissionKey ?? "");
  const overlayId = body.overlayId ? String(body.overlayId) : null;
  const widgetInstanceId = body.widgetInstanceId ? String(body.widgetInstanceId) : null;
  const enabled = Boolean(body.enabled);

  if (!channelRoleId || !permissionKey) return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  const admin = createServiceClient();
  if (enabled) {
    const { error } = await admin.from("permissions").insert({ channel_role_id: channelRoleId, permission_key: permissionKey, overlay_id: overlayId, widget_instance_id: widgetInstanceId });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  } else {
    let q = admin.from("permissions").delete().eq("channel_role_id", channelRoleId).eq("permission_key", permissionKey);
    if (overlayId) q = q.eq("overlay_id", overlayId); else q = q.is("overlay_id", null);
    if (widgetInstanceId) q = q.eq("widget_instance_id", widgetInstanceId); else q = q.is("widget_instance_id", null);
    const { error } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}



