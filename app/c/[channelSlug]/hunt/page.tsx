import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { getWebsiteConfig, getTheme } from "@/lib/website-config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ChannelHuntPage({ params }: { params: Promise<{ channelSlug: string }> }) {
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
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-block w-1 h-5 rounded-full" style={{ background: t.headingBar }} />
          <h1 className="text-xl font-black uppercase tracking-wider" style={{ color: t.headingText }}>
            Bonus Hunt
          </h1>
        </div>
        <p className="text-sm ml-3" style={{ color: t.mutedText }}>
          Live bonus hunt tracker — click to follow along
        </p>
      </div>

      {hunts.length === 0 ? (
        <div className="rounded-xl border p-8 text-center" style={{ borderColor: t.emptyBorder, background: t.emptyBg }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: t.badgeBg }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="11" stroke={t.iconAccent} strokeWidth="1.5" strokeOpacity="0.5" />
              <path d="M14 8v6l4 2" stroke={t.iconAccent} strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />
            </svg>
          </div>
          <p className="text-sm font-semibold mb-1" style={{ color: t.mutedText }}>
            No active bonus hunt
          </p>
          <p className="text-xs" style={{ color: t.subtleText }}>
            {channelSlug} hasn&apos;t started a hunt yet. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hunts.map((h, i) => (
            <a
              key={h.id}
              href={h.href}
              target="_blank"
              rel="noreferrer"
              className="group block rounded-xl border overflow-hidden transition-all duration-200"
              style={{ borderColor: t.cardBorder, background: t.cardBg }}
            >
              <div className="h-1 w-full" style={{ background: t.headingBar }} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: t.badgeBg }}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="7.5" stroke={t.iconAccent} strokeWidth="1.5" />
                      <path d="M10 6.5v3.5l2.5 1.5" stroke={t.iconAccent} strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold"
                    style={{ background: t.liveBg, color: t.liveText }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: t.liveText }} />
                    LIVE
                  </span>
                </div>

                <p className="font-black text-base mb-1" style={{ color: t.tableColText }}>
                  Bonus Hunt #{String(i + 1).padStart(2, "0")}
                </p>
                <p className="text-xs mb-4" style={{ color: t.subtleText }}>
                  Realtime tracker — guesses open
                </p>

                <div
                  className="flex items-center justify-between rounded-lg px-3 py-2 transition-all group-hover:opacity-90"
                  style={{ background: t.huntCta, border: `1px solid ${t.huntCtaBorder}` }}
                >
                  <span className="text-xs font-bold" style={{ color: t.huntCtaText }}>
                    Open tracker
                  </span>
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    style={{ background: t.huntCtaBorder }}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M1.5 8.5L8.5 1.5M8.5 1.5H3.5M8.5 1.5V6.5" stroke={t.huntCtaIcon} strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
