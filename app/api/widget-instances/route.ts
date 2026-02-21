import { NextRequest, NextResponse } from "next/server";
import { widgetInstanceCreateSchema } from "@/lib/schemas/overlay";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import { AuthzError, getOverlayChannelId, requireChannelPermission } from "@/lib/authz";

export async function POST(req: NextRequest) {
  const parsed = widgetInstanceCreateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const userClient = await createServerClient();
  const { data: auth } = await userClient.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const channelId = await getOverlayChannelId(parsed.data.overlayId);
    await requireChannelPermission({ userId: auth.user.id, channelId, permissionKey: "widget_manage", overlayId: parsed.data.overlayId });

    const admin = createServiceClient();
    const { data, error } = await admin.from("widget_instances").insert({
      overlay_id: parsed.data.overlayId,
      kind: parsed.data.kind,
      name: parsed.data.name,
      x: parsed.data.x,
      y: parsed.data.y,
      width: parsed.data.width,
      height: parsed.data.height
    }).select("id").single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    await admin.from("widget_configs").insert({ widget_instance_id: data.id, config: {} });
    return NextResponse.json({ widgetInstanceId: data.id });
  } catch (error) {
    if (error instanceof AuthzError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "failed" }, { status: 400 });
  }
}



