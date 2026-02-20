import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

export async function GET(_: NextRequest, { params }: any) {
  const userClient = createServerClient();
  const { data: auth } = await userClient.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const admin = createServiceClient();
  const { data, error } = await admin
    .from("widget_instances")
    .select("id,kind,name,x,y,width,height,layer_index,is_enabled,widget_configs(config)")
    .eq("overlay_id", params.overlayId)
    .order("layer_index", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ widgets: data ?? [] });
}


