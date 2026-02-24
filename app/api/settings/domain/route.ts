import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

const RENDER_API = "https://api.render.com/v1";

async function renderAddDomain(domain: string): Promise<{ id: string } | null> {
  const apiKey = process.env.RENDER_API_KEY;
  const serviceId = process.env.RENDER_SERVICE_ID;
  if (!apiKey || !serviceId) return null;

  const res = await fetch(`${RENDER_API}/services/${serviceId}/custom-domains`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name: domain }),
  });
  if (!res.ok) return null;
  const data = await res.json() as { customDomain?: { id: string } };
  return data.customDomain ?? null;
}

async function renderRemoveDomain(domain: string): Promise<void> {
  const apiKey = process.env.RENDER_API_KEY;
  const serviceId = process.env.RENDER_SERVICE_ID;
  if (!apiKey || !serviceId) return;

  // First list to find the ID
  const listRes = await fetch(`${RENDER_API}/services/${serviceId}/custom-domains?limit=100`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!listRes.ok) return;
  const listData = await listRes.json() as { customDomain?: { id: string; name: string } }[];
  const entry = listData.find((r) => r.customDomain?.name === domain);
  if (!entry?.customDomain?.id) return;

  await fetch(`${RENDER_API}/services/${serviceId}/custom-domains/${entry.customDomain.id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${apiKey}` },
  });
}

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

  // Fetch current domain so we can remove it from Render if it changes
  const { data: channel } = await admin
    .from("channels")
    .select("id, custom_domain")
    .eq("owner_id", auth.user.id)
    .maybeSingle();

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

  // Sync with Render — remove old domain, add new one
  const oldDomain = (channel as any)?.custom_domain as string | null ?? null;
  if (oldDomain && oldDomain !== domain) {
    await renderRemoveDomain(oldDomain);
  }
  if (domain && domain !== oldDomain) {
    await renderAddDomain(domain);
  }

  return NextResponse.json({ ok: true, domain });
}
