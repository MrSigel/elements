import { getWebsiteConfig } from "@/lib/website-config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ChannelStartseitePage({ params }: { params: Promise<{ channelSlug: string }> }) {
  const { channelSlug } = await params;
  const cfg = await getWebsiteConfig(channelSlug);
  const deals = cfg.deals ?? [];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span
            className="inline-block w-1 h-5 rounded-full"
            style={{ background: "linear-gradient(180deg, #f5c451, #b22234)" }}
          />
          <h1 className="text-xl font-black uppercase tracking-wider" style={{ color: "#f5c451" }}>
            Casino Deals
          </h1>
        </div>
      </div>

      {deals.length === 0 ? (
        <div
          className="rounded-xl border p-8 text-center"
          style={{ borderColor: "rgba(245,196,81,0.1)", background: "rgba(245,196,81,0.03)" }}
        >
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
            No deals published yet. Check back soon.
          </p>
        </div>
      ) : (
        <div className="overflow-auto rounded-xl border" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <table className="w-full min-w-[700px] text-sm border-collapse">
            <thead>
              <tr style={{ background: "rgba(245,196,81,0.06)", borderBottom: "1px solid rgba(245,196,81,0.12)" }}>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest" style={{ color: "#f5c451" }}>
                  #
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Casino
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Wager
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Bonus Code
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.5)" }}>
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
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    background: i % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent"
                  }}
                >
                  <td className="px-4 py-3.5 font-mono text-xs" style={{ color: "rgba(245,196,81,0.5)" }}>
                    {String(i + 1).padStart(2, "0")}
                  </td>
                  <td className="px-4 py-3.5 font-semibold" style={{ color: "#e5edf5" }}>
                    {d.casinoName || "—"}
                  </td>
                  <td className="px-4 py-3.5">
                    {d.wager ? (
                      <span
                        className="inline-block rounded-md px-2 py-0.5 text-xs font-bold"
                        style={{ background: "rgba(245,196,81,0.12)", color: "#f5c451" }}
                      >
                        {d.wager}
                      </span>
                    ) : (
                      <span style={{ color: "rgba(255,255,255,0.25)" }}>—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    {d.bonusCode ? (
                      <span
                        className="inline-block rounded-md px-2 py-0.5 text-xs font-mono font-bold border"
                        style={{
                          background: "rgba(178,34,52,0.1)",
                          borderColor: "rgba(178,34,52,0.3)",
                          color: "#ff8c8c"
                        }}
                      >
                        {d.bonusCode}
                      </span>
                    ) : (
                      <span style={{ color: "rgba(255,255,255,0.25)" }}>—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                    {d.actionAfterSignup || "—"}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {d.casinoUrl ? (
                      <a
                        href={d.casinoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all"
                        style={{
                          background: "linear-gradient(135deg, #f5c451, #e8a020)",
                          color: "#000"
                        }}
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
