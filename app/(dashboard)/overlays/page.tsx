import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { OverlayCreateForm } from "@/components/forms/OverlayCreateForm";
import { OverlayTable } from "@/components/forms/OverlayTable";
import { TwitchSuccessBanner } from "@/components/TwitchSuccessBanner";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import { getAccessibleChannelIds } from "@/lib/dashboard-scope";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OverlaysPage({ searchParams }: { searchParams: Promise<{ twitch?: string }> }) {
  const { twitch } = await searchParams;
  const userClient = await createServerClient();
  const { data: auth } = await userClient.auth.getUser();
  if (!auth.user) {
    return (
      <DashboardShell>
        <p className="text-subtle">Unauthorized.</p>
      </DashboardShell>
    );
  }

  const channelIds = await getAccessibleChannelIds(auth.user.id);
  const admin = createServiceClient();
  const { data: overlays } = channelIds.length
    ? await admin
        .from("overlays")
        .select("id,name,is_published,width,height,overlay_tokens(public_token,revoked)")
        .in("channel_id", channelIds)
        .order("created_at", { ascending: false })
    : { data: [] as never[] };

  return (
    <DashboardShell>
      <div className="space-y-6 p-6">
        {twitch === "connected" && <TwitchSuccessBanner />}
        <div>
          <h1 className="text-2xl font-black text-text">Overlays</h1>
          <p className="text-sm text-subtle mt-1">Create and manage your OBS overlay sources. Each overlay gets a public BrowserSource URL you add to OBS.</p>
        </div>

        {/* OBS Setup Guide */}
        <section className="rounded-xl border border-accent/15 bg-accent/5 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-accent flex-shrink-0">
              <rect x="1" y="2" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M5 12v2M11 12v2M4 14h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">How overlays work in OBS</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-panelMuted bg-panel/60 p-3.5 space-y-1.5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-accent/20 text-accent text-[11px] font-black flex items-center justify-center flex-shrink-0">1</span>
                <p className="text-xs font-semibold text-text">Create an Overlay</p>
              </div>
              <p className="text-xs text-subtle leading-relaxed">Use the form below to create a new overlay. Choose a name and set the resolution (default 1920×1080).</p>
            </div>

            <div className="rounded-lg border border-panelMuted bg-panel/60 p-3.5 space-y-1.5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-accent/20 text-accent text-[11px] font-black flex items-center justify-center flex-shrink-0">2</span>
                <p className="text-xs font-semibold text-text">Copy the OBS URL</p>
              </div>
              <p className="text-xs text-subtle leading-relaxed">Click <span className="text-text font-medium">Copy OBS URL</span> in the overlay row. This is the unique BrowserSource link for your overlay.</p>
            </div>

            <div className="rounded-lg border border-panelMuted bg-panel/60 p-3.5 space-y-1.5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-accent/20 text-accent text-[11px] font-black flex items-center justify-center flex-shrink-0">3</span>
                <p className="text-xs font-semibold text-text">Add to OBS</p>
              </div>
              <p className="text-xs text-subtle leading-relaxed">In OBS: <span className="text-text font-medium">Sources → + → Browser Source</span>. Paste the URL. Set width/height to match your overlay (e.g. 1920 × 1080).</p>
            </div>

            <div className="rounded-lg border border-panelMuted bg-panel/60 p-3.5 space-y-1.5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-accent/20 text-accent text-[11px] font-black flex items-center justify-center flex-shrink-0">4</span>
                <p className="text-xs font-semibold text-text">Control in Dashboard</p>
              </div>
              <p className="text-xs text-subtle leading-relaxed">Go to <span className="text-text font-medium">Widgets → Live Controls</span> in this dashboard. Changes appear live in OBS instantly — no refresh needed.</p>
            </div>
          </div>

          <p className="text-[11px] text-subtle/50 leading-relaxed">
            The overlay is a transparent webpage displayed over your stream. It updates in real time via Supabase Realtime — no page reload or OBS interaction required.
          </p>
        </section>

        <OverlayCreateForm />
        <OverlayTable overlays={(overlays ?? []) as never[]} />
      </div>
    </DashboardShell>
  );
}

