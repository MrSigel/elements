import { NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import { AuthzError, requireChannelPermission } from "@/lib/authz";

async function pageChannel(viewerPageId: string) {
  const admin = createServiceClient();
  const { data } = await admin.from("viewer_pages").select("id,channel_id,overlay_id").eq("id", viewerPageId).single();
  if (!data) throw new AuthzError("viewer_page_not_found", 404);
  return data;
}

export async function POST(_: Request, { params }: any) {
  const userClient = createServerClient();
  const { data: auth } = await userClient.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const page = await pageChannel(params.viewerPageId);
    await requireChannelPermission({ userId: auth.user.id, channelId: page.channel_id, permissionKey: "frontpage_manage", overlayId: page.overlay_id });

    const admin = createServiceClient();
    const { error } = await admin.from("viewer_tokens").update({ revoked: true }).eq("viewer_page_id", params.viewerPageId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthzError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "failed" }, { status: 400 });
  }
}


