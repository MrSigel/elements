import { NextRequest, NextResponse } from "next/server";
import { overlayCreateSchema } from "@/lib/schemas/overlay";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const admin = createServiceClient();
  const { data } = await admin.from("overlays").select("id,name,width,height,is_published,channel_id,overlay_tokens(public_token,revoked)").order("created_at", { ascending: false });
  return NextResponse.json({ overlays: data ?? [] });
}

export async function POST(req: NextRequest) {
  const parsed = overlayCreateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const userClient = createServerClient();
  const { data: auth } = await userClient.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const admin = createServiceClient();
  const { data: channel } = await admin.from("channels").select("id").eq("owner_id", auth.user.id).single();
  if (!channel) return NextResponse.json({ error: "channel_not_found" }, { status: 404 });

  const { data, error } = await admin.from("overlays").insert({
    channel_id: channel.id,
    name: parsed.data.name,
    width: parsed.data.width,
    height: parsed.data.height
  }).select("id").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ overlayId: data.id });
}

