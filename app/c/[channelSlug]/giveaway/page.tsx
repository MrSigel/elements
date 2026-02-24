import { getWebsiteConfig, getTheme } from "@/lib/website-config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ChannelGiveawayPage({ params }: { params: Promise<{ channelSlug: string }> }) {
  const { channelSlug } = await params;
  const cfg = await getWebsiteConfig(channelSlug);
  const giveaways = cfg.giveaways ?? [];
  const t = getTheme(cfg.template);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-block w-1 h-5 rounded-full" style={{ background: t.headingBar }} />
          <h1 className="text-xl font-black uppercase tracking-wider" style={{ color: t.headingText }}>
            Giveaways
          </h1>
        </div>
        <p className="text-sm ml-3" style={{ color: t.mutedText }}>
          Active giveaways from {channelSlug}
        </p>
      </div>

      {giveaways.length === 0 ? (
        <div className="rounded-xl border p-8 text-center" style={{ borderColor: t.emptyBorder, background: t.emptyBg }}>
          <p className="text-sm" style={{ color: t.subtleText }}>
            No active giveaways right now. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {giveaways.map((g, i) => (
            <article
              key={`${g.title}-${i}`}
              className="rounded-xl overflow-hidden border"
              style={{ borderColor: t.cardBorder, background: t.cardBg }}
            >
              <div className="h-1 w-full" style={{ background: t.headingBar }} />
              <div className="p-5">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: t.badgeBg }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M5 2H15V10C15 12.761 12.761 15 10 15C7.239 15 5 12.761 5 10V2Z" stroke={t.iconAccent} strokeWidth="1.5" />
                    <path d="M5 5H2C2 7.761 3.791 10.094 6.279 10.828" stroke={t.iconAccent} strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M15 5H18C18 7.761 16.209 10.094 13.721 10.828" stroke={t.iconAccent} strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M10 15V18" stroke={t.iconAccent} strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M7 18H13" stroke={t.iconAccent} strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>

                <h2 className="font-black text-base mb-2" style={{ color: t.tableColText }}>
                  {g.title || "Untitled Giveaway"}
                </h2>
                <p className="text-sm leading-relaxed mb-4" style={{ color: t.mutedText }}>
                  {g.description || "No description provided."}
                </p>

                {g.endAt && (
                  <div
                    className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold"
                    style={{ background: t.codeBg, color: t.codeText }}
                  >
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1.3" />
                      <path d="M5.5 3V5.5L7 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                    Ends: {g.endAt}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
