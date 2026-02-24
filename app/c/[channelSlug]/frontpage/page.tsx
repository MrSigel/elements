import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { getWebsiteConfig, getTheme } from "@/lib/website-config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PAGE_META: Record<string, { label: string; description: string; color: string }> = {
  bonushunt: { label: "Bonus Hunt", description: "Live hunt tracker with stats & guessing", color: "#f5c451" },
  tournament: { label: "Tournament", description: "Live viewer tournament scoreboard", color: "#7c3aed" },
  requests: { label: "Slot Requests", description: "Submit slot requests in live chat", color: "#0891b2" },
  loyalty: { label: "Loyalty Store", description: "Redeem points for rewards", color: "#059669" },
  battle: { label: "Points Battle", description: "Live team points battle leaderboard", color: "#b22234" }
};

export default async function ChannelFrontpagePage({ params }: { params: Promise<{ channelSlug: string }> }) {
  const { channelSlug } = await params;
  const admin = createServiceClient();

  const { data: channel } = await admin.from("channels").select("id").eq("slug", channelSlug).maybeSingle();
  if (!channel) return notFound();

  const cfg = await getWebsiteConfig(channelSlug);
  const t = getTheme(cfg.template);

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
      const meta = PAGE_META[p.page_type as string] ?? { label: p.page_type, description: "", color: "#f5c451" };
      return {
        id: p.id as string,
        pageType: p.page_type as string,
        label: meta.label,
        description: meta.description,
        color: meta.color,
        href: `/v/${tokenRel.public_token}/${p.page_type}`
      };
    })
    .filter(Boolean) as {
      id: string;
      pageType: string;
      label: string;
      description: string;
      color: string;
      href: string;
    }[];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-block w-1 h-5 rounded-full" style={{ background: t.headingBar }} />
          <h1 className="text-xl font-black uppercase tracking-wider" style={{ color: t.headingText }}>
            Live Pages
          </h1>
        </div>
        <p className="text-sm ml-3" style={{ color: t.mutedText }}>
          Real-time viewer pages — click to open
        </p>
      </div>

      {links.length === 0 ? (
        <div className="rounded-xl border p-8 text-center" style={{ borderColor: t.emptyBorder, background: t.emptyBg }}>
          <p className="text-sm" style={{ color: t.subtleText }}>
            No active live pages yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((l) => (
            <a
              key={l.id}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              className="group block rounded-xl border transition-all duration-200 overflow-hidden"
              style={{ borderColor: t.cardBorder, background: t.cardBg }}
            >
              <div className="h-1 w-full" style={{ background: l.color }} />
              <div className="p-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-black text-sm mb-1" style={{ color: t.tableColText }}>
                    {l.label}
                  </p>
                  {l.description && (
                    <p className="text-xs leading-relaxed" style={{ color: t.mutedText }}>
                      {l.description}
                    </p>
                  )}
                </div>
                <div
                  className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  style={{ background: t.badgeBg }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 10L10 2M10 2H5M10 2V7" stroke={l.color} strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
