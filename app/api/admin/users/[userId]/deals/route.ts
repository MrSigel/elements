import { NextRequest, NextResponse } from "next/server";
import { isValidAdminToken } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase/server";
import type { WebsiteConfig } from "@/lib/website-config";

async function getChannelByOwner(userId: string) {
  const admin = createServiceClient();
  const { data } = await admin
    .from("channels")
    .select("id,slug,website_config")
    .eq("owner_id", userId)
    .limit(1)
    .maybeSingle();
  return data;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const adminToken = req.cookies.get("admin-token")?.value;
  if (!isValidAdminToken(adminToken)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { userId } = await params;
  const channel = await getChannelByOwner(userId);
  if (!channel) {
    return NextResponse.json({ error: "channel_not_found" }, { status: 404 });
  }

  const cfg = channel.website_config as Partial<WebsiteConfig> | null;
  const deals = Array.isArray(cfg?.deals) ? cfg.deals : [];
  const giveaways = Array.isArray(cfg?.giveaways) ? cfg.giveaways : [];
  const navBrand = typeof cfg?.navBrand === "string" ? cfg.navBrand : "Pulseframelabs";

  return NextResponse.json({ channelSlug: channel.slug, config: { navBrand, deals, giveaways } });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const adminToken = req.cookies.get("admin-token")?.value;
  if (!isValidAdminToken(adminToken)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { userId } = await params;
  const channel = await getChannelByOwner(userId);
  if (!channel) {
    return NextResponse.json({ error: "channel_not_found" }, { status: 404 });
  }

  let body: { config: WebsiteConfig };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const admin = createServiceClient();
  const { error } = await admin
    .from("channels")
    .update({ website_config: body.config })
    .eq("id", channel.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
