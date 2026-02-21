import { getWebsiteConfig } from "@/lib/website-config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ChannelStartseitePage({ params }: { params: Promise<{ channelSlug: string }> }) {
  const { channelSlug } = await params;
  const cfg = await getWebsiteConfig(channelSlug);
  const deals = cfg.deals ?? [];

  return (
    <section className="rounded-xl border border-[#2a3142] bg-[#111827] p-4">
      <h1 className="mb-3 text-lg font-semibold">Casino Deals</h1>
      {deals.length === 0 ? (
        <p className="text-sm text-slate-400">No deals added yet.</p>
      ) : (
        <div className="overflow-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="text-left text-slate-300">
                <th className="pb-2 pr-3">Casino</th>
                <th className="pb-2 pr-3">Casino Link</th>
                <th className="pb-2 pr-3">Wager</th>
                <th className="pb-2 pr-3">Bonus Code</th>
                <th className="pb-2">Bonus Action</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((d, i) => (
                <tr key={`${d.casinoName}-${i}`} className="border-t border-[#2a3142]">
                  <td className="py-2 pr-3">{d.casinoName || "-"}</td>
                  <td className="py-2 pr-3">
                    {d.casinoUrl ? (
                      <a href={d.casinoUrl} target="_blank" rel="noreferrer" className="text-amber-300 underline break-all">
                        {d.casinoUrl}
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="py-2 pr-3">{d.wager || "-"}</td>
                  <td className="py-2 pr-3">{d.bonusCode || "-"}</td>
                  <td className="py-2">{d.actionAfterSignup || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

