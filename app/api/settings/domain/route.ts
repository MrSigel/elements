import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

export async function PUT(req: NextRequest) {
  const userClient = await createServerClient();
  const { data: auth } = await userClient.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null) as { domain?: string } | null;
  const raw = (body?.domain ?? "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
  const domain = raw || null;

  // Basic domain format validation
  if (domain && !/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/.test(domain)) {
    return NextResponse.json({ error: "invalid_domain_format" }, { status: 400 });
  }

  const admin = createServiceClient();

  // Check uniqueness (another channel already using this domain)
  if (domain) {
    const { data: existing } = await admin
      .from("channels")
      .select("id, owner_id")
      .eq("custom_domain", domain)
      .maybeSingle();
    if (existing && existing.owner_id !== auth.user.id) {
      return NextResponse.json({ error: "domain_already_taken" }, { status: 409 });
    }
  }

  const { error } = await admin
    .from("channels")
    .update({ custom_domain: domain })
    .eq("owner_id", auth.user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, domain });
}
