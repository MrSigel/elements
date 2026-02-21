import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import { getWebsiteConfig, setWebsiteConfig, WebsiteConfig } from "@/lib/website-config";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "missing_slug" }, { status: 400 });
  const config = await getWebsiteConfig(slug);
  return NextResponse.json({ config });
}

export async function PUT(req: NextRequest) {
  const userClient = await createServerClient();
  const { data: auth } = await userClient.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { config?: WebsiteConfig } | null;
  if (!body?.config) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  const admin = createServiceClient();
  const { data: channel } = await admin.from("channels").select("slug").eq("owner_id", auth.user.id).limit(1).maybeSingle();
  if (!channel?.slug) return NextResponse.json({ error: "channel_not_found" }, { status: 404 });

  await setWebsiteConfig(channel.slug, body.config);
  return NextResponse.json({ ok: true, slug: channel.slug });
}

