import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function pageLabel(pageType: string) {
  if (pageType === "bonushunt") return "Bonushunt";
  if (pageType === "tournament") return "Tournament";
  if (pageType === "requests") return "Slot Requests";
  return pageType;
}

export default async function ChannelFrontpagePage({ params }: { params: Promise<{ channelSlug: string }> }) {
  const { channelSlug } = await params;
  const admin = createServiceClient();

  const { data: channel } = await admin.from("channels").select("id").eq("slug", channelSlug).maybeSingle();
  if (!channel) return null;

  const { data: pages } = await admin
    .from("viewer_pages")
    .select("id,page_type,enabled,created_at,viewer_tokens(public_token,revoked)")
    .eq("channel_id", channel.id)
    .eq("enabled", true)
    .order("created_at", { ascending: false });

  const links = (pages ?? [])
    .map((p: any) => {
      const tokenRel = Array.isArray(p.viewer_tokens) ? p.viewer_tokens[0] : p.viewer_tokens;
      if (!tokenRel || tokenRel.revoked || !tokenRel.public_token) return null;
      return {
        id: p.id as string,
        pageType: p.page_type as string,
        label: pageLabel(p.page_type),
        href: `/v/${tokenRel.public_token}/${p.page_type}`,
        token: tokenRel.public_token as string
      };
    })
    .filter(Boolean) as { id: string; pageType: string; label: string; href: string; token: string }[];

  return (
    <section className="rounded-xl border border-[#2a3142] bg-[#111827] p-4">
      <h1 className="mb-3 text-lg font-semibold">Frontpage</h1>
      {links.length === 0 ? (
        <p className="text-sm text-slate-400">No active frontpages yet.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {links.map((l) => (
            <article key={l.id} className="rounded-lg border border-[#2a3142] bg-[#0f1728] p-3">
              <p className="text-xs uppercase text-slate-400">{l.label}</p>
              <p className="mt-1 text-xs text-slate-400">Type: {l.pageType}</p>
              <a href={l.href} target="_blank" rel="noreferrer" className="mt-2 block break-all text-sm text-amber-300 underline">
                {l.href}
              </a>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

