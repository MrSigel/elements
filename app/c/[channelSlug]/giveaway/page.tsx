import { getWebsiteConfig } from "@/lib/website-config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ChannelGiveawayPage({ params }: { params: Promise<{ channelSlug: string }> }) {
  const { channelSlug } = await params;
  const cfg = await getWebsiteConfig(channelSlug);
  const giveaways = cfg.giveaways ?? [];

  return (
    <section className="rounded-xl border border-[#2a3142] bg-[#111827] p-4">
      <h1 className="mb-3 text-lg font-semibold">Giveaway</h1>
      {giveaways.length === 0 ? (
        <p className="text-sm text-slate-400">No giveaways added yet.</p>
      ) : (
        <div className="space-y-3">
          {giveaways.map((g, i) => (
            <article key={`${g.title}-${i}`} className="rounded-lg border border-[#2a3142] bg-[#0f1728] p-3">
              <h2 className="font-semibold">{g.title || "Untitled Giveaway"}</h2>
              <p className="mt-1 text-sm text-slate-300">{g.description || "-"}</p>
              {g.endAt ? <p className="mt-2 text-xs text-slate-400">Ends: {g.endAt}</p> : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

