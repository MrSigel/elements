import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ChannelHuntPage({ params }: { params: Promise<{ channelSlug: string }> }) {
  const { channelSlug } = await params;
  const admin = createServiceClient();

  const { data: channel } = await admin.from("channels").select("id").eq("slug", channelSlug).maybeSingle();
  if (!channel) return null;

  const { data: pages } = await admin
    .from("viewer_pages")
    .select("id,page_type,enabled,viewer_tokens(public_token,revoked)")
    .eq("channel_id", channel.id)
    .eq("enabled", true)
    .eq("page_type", "bonushunt")
    .order("created_at", { ascending: false });

  const hunts = (pages ?? [])
    .map((p: any) => {
      const tokenRel = Array.isArray(p.viewer_tokens) ? p.viewer_tokens[0] : p.viewer_tokens;
      if (!tokenRel || tokenRel.revoked || !tokenRel.public_token) return null;
      return { id: p.id as string, href: `/v/${tokenRel.public_token}/bonushunt` };
    })
    .filter(Boolean) as { id: string; href: string }[];

  return (
    <section className="rounded-xl border border-[#2a3142] bg-[#111827] p-4">
      <h1 className="mb-3 text-lg font-semibold">Hunt</h1>
      {hunts.length === 0 ? (
        <p className="text-sm text-slate-400">No active bonushunt frontpages yet.</p>
      ) : (
        <div className="space-y-2">
          {hunts.map((h, i) => (
            <a key={h.id} href={h.href} target="_blank" rel="noreferrer" className="block rounded-lg border border-[#2a3142] bg-[#0f1728] px-3 py-2 text-sm text-amber-300 underline break-all">
              Hunt Link {i + 1}: {h.href}
            </a>
          ))}
        </div>
      )}
    </section>
  );
}

