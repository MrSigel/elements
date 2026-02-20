import { NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

export async function POST(_: Request, { params }: any) {
  const userClient = createServerClient();
  const { data: auth } = await userClient.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const admin = createServiceClient();
  const { data: source } = await admin
    .from("overlays")
    .select("id,channel_id,name,width,height,theme,widget_instances(*)")
    .eq("id", params.overlayId)
    .single();

  if (!source) return NextResponse.json({ error: "overlay_not_found" }, { status: 404 });

  const { data: dup, error: dupError } = await admin.from("overlays").insert({
    channel_id: source.channel_id,
    name: `${source.name} Copy`,
    width: source.width,
    height: source.height,
    theme: source.theme
  }).select("id").single();

  if (dupError || !dup) return NextResponse.json({ error: dupError?.message ?? "duplicate_failed" }, { status: 400 });

  const widgets = (source.widget_instances as Array<Record<string, unknown>> | null) ?? [];
  if (widgets.length > 0) {
    const inserts = widgets.map((w) => ({
      overlay_id: dup.id,
      kind: w.kind,
      name: w.name,
      layer_index: w.layer_index,
      x: w.x,
      y: w.y,
      width: w.width,
      height: w.height,
      is_enabled: w.is_enabled
    }));
    await admin.from("widget_instances").insert(inserts);
  }

  return NextResponse.json({ overlayId: dup.id });
}


