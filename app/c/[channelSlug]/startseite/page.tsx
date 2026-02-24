import { getWebsiteConfig, getTheme } from "@/lib/website-config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ChannelStartseitePage({ params }: { params: Promise<{ channelSlug: string }> }) {
  const { channelSlug } = await params;
  const cfg = await getWebsiteConfig(channelSlug);
  const deals = cfg.deals ?? [];
  const t = getTheme(cfg.template);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-block w-1 h-5 rounded-full" style={{ background: t.headingBar }} />
          <h1 className="text-xl font-black uppercase tracking-wider" style={{ color: t.headingText }}>
            Casino Deals
          </h1>
        </div>
      </div>

      {deals.length === 0 ? (
        <div className="rounded-xl border p-8 text-center" style={{ borderColor: t.emptyBorder, background: t.emptyBg }}>
          <p className="text-sm" style={{ color: t.subtleText }}>
            No deals published yet. Check back soon.
          </p>
        </div>
      ) : (
        <div className="overflow-auto rounded-xl border" style={{ borderColor: t.cardBorder }}>
          <table className="w-full min-w-[700px] text-sm border-collapse">
            <thead>
              <tr style={{ background: t.tableHeaderBg, borderBottom: `1px solid ${t.tableHeaderBorder}` }}>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest" style={{ color: t.tableHeaderText }}>
                  #
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest" style={{ color: t.mutedText }}>
                  Casino
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest" style={{ color: t.mutedText }}>
                  Wager
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest" style={{ color: t.mutedText }}>
                  Bonus Code
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest" style={{ color: t.mutedText }}>
                  After Registration
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {deals.map((d, i) => (
                <tr
                  key={`${d.casinoName}-${i}`}
                  className="group transition-colors"
                  style={{
                    borderBottom: `1px solid ${t.cardBorder}`,
                    background: i % 2 === 0 ? t.tableRowEven : "transparent"
                  }}
                >
                  <td className="px-4 py-3.5 font-mono text-xs" style={{ color: t.badgeText, opacity: 0.6 }}>
                    {String(i + 1).padStart(2, "0")}
                  </td>
                  <td className="px-4 py-3.5 font-semibold" style={{ color: t.tableColText }}>
                    {d.casinoName || "—"}
                  </td>
                  <td className="px-4 py-3.5">
                    {d.wager ? (
                      <span className="inline-block rounded-md px-2 py-0.5 text-xs font-bold" style={{ background: t.badgeBg, color: t.badgeText }}>
                        {d.wager}
                      </span>
                    ) : (
                      <span style={{ color: t.subtleText }}>—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    {d.bonusCode ? (
                      <span
                        className="inline-block rounded-md px-2 py-0.5 text-xs font-mono font-bold border"
                        style={{ background: t.codeBg, borderColor: t.codeBorder, color: t.codeText }}
                      >
                        {d.bonusCode}
                      </span>
                    ) : (
                      <span style={{ color: t.subtleText }}>—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-sm" style={{ color: t.mutedText }}>
                    {d.actionAfterSignup || "—"}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {d.casinoUrl ? (
                      <a
                        href={d.casinoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all"
                        style={{ background: t.visitBg, color: t.visitText }}
                      >
                        Visit
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M1.5 8.5L8.5 1.5M8.5 1.5H3.5M8.5 1.5V6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                        </svg>
                      </a>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
