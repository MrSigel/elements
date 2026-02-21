import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ChannelLandingPage({ params }: { params: Promise<{ channelSlug: string }> }) {
  const { channelSlug } = await params;
  const admin = createServiceClient();

  const { data: channel } = await admin.from("channels").select("id,title,slug").eq("slug", channelSlug).maybeSingle();
  if (!channel) return notFound();

  const { data: pages } = await admin
    .from("viewer_pages")
    .select("id,page_type,enabled,viewer_tokens(public_token,revoked)")
    .eq("channel_id", channel.id)
    .eq("enabled", true)
    .order("created_at", { ascending: false });

  const links = (pages ?? [])
    .map((p: any) => {
      const tokenRel = Array.isArray(p.viewer_tokens) ? p.viewer_tokens[0] : p.viewer_tokens;
      if (!tokenRel || tokenRel.revoked || !tokenRel.public_token) return null;
      return {
        label: p.page_type === "bonushunt" ? "Bonushunt" : p.page_type === "tournament" ? "Tournament" : p.page_type === "requests" ? "Slot Requests" : p.page_type,
        href: `/v/${tokenRel.public_token}/${p.page_type}`
      };
    })
    .filter(Boolean) as { label: string; href: string }[];

  return (
    <main className="min-h-screen bg-[#0a0d14] text-white">
      <header className="border-b border-[#2a3142] bg-[#0d1320] px-6 py-3">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <p className="font-bold tracking-wide">Elements</p>
          <nav className="flex gap-4 text-sm text-slate-300">
            <a href="#startseite">Startseite</a>
            <a href="#hunt">Hunt</a>
            <a href="#giveaway">Giveaway</a>
            <a href="#frontpage">Frontpage</a>
          </nav>
        </div>
      </header>

      <section id="startseite" className="mx-auto max-w-6xl px-6 py-8">
        <div id="hunt" className="rounded-xl border border-[#2a3142] bg-[#111827] p-4">
          <h2 className="text-lg font-semibold mb-3">Hunt</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-300">
                <th className="pb-2 pr-3">Casino</th>
                <th className="pb-2 pr-3">Link</th>
                <th className="pb-2 pr-3">Wager</th>
                <th className="pb-2 pr-3">Bonus Code</th>
                <th className="pb-2">After Register</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-[#2a3142]">
                <td className="py-2 pr-3">Configure in Dashboard</td>
                <td className="py-2 pr-3">-</td>
                <td className="py-2 pr-3">-</td>
                <td className="py-2 pr-3">-</td>
                <td className="py-2">-</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div id="giveaway" className="mt-6 rounded-xl border border-[#2a3142] bg-[#111827] p-4">
          <h2 className="text-lg font-semibold mb-2">Giveaway</h2>
          <p className="text-sm text-slate-400">Giveaway section can be configured by the streamer.</p>
        </div>

        <div id="frontpage" className="mt-6 rounded-xl border border-[#2a3142] bg-[#111827] p-4">
          <h2 className="text-lg font-semibold mb-3">Frontpage</h2>
          {links.length === 0 ? (
            <p className="text-sm text-slate-400">No public frontpages yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {links.map((l) => (
                <a key={l.href} href={l.href} className="rounded border border-[#344055] bg-[#0f1728] px-3 py-2 text-sm text-slate-200">
                  {l.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="border-t border-[#2a3142] bg-[#0d1320] px-6 py-3 text-center text-xs text-slate-400">
        Copyright Elements
      </footer>
    </main>
  );
}
