import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import { getAccessibleChannelIds } from "@/lib/dashboard-scope";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatInt(n: number) {
  return new Intl.NumberFormat("de-DE").format(n);
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(n);
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return iso;
  }
}

export default async function DashboardHomePage() {
  const userClient = await createServerClient();
  const { data: auth } = await userClient.auth.getUser();
  if (!auth.user) {
    return (
      <DashboardShell>
        <p className="text-subtle p-6">Unauthorized.</p>
      </DashboardShell>
    );
  }

  const channelIds = await getAccessibleChannelIds(auth.user.id);
  const admin = createServiceClient();

  if (!channelIds.length) {
    return (
      <DashboardShell>
        <div className="p-6">
          <h1 className="text-2xl font-black text-text">Home</h1>
          <p className="text-sm text-subtle mt-1">No channel found yet. Create your first overlay to start collecting live statistics.</p>
        </div>
      </DashboardShell>
    );
  }

  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: overlays }, overlaysCountRes, events24hRes, { data: recentEvents }, { data: requests }, { data: points }, { data: txs }] = await Promise.all([
    admin.from("overlays").select("id,name,is_published,created_at").in("channel_id", channelIds).order("created_at", { ascending: false }),
    admin.from("overlays").select("*", { count: "exact", head: true }).in("channel_id", channelIds),
    admin.from("widget_events").select("*", { count: "exact", head: true }).in("channel_id", channelIds).gte("created_at", since24h),
    admin.from("widget_events").select("widget_type,event_type,created_at").in("channel_id", channelIds).order("created_at", { ascending: false }).limit(20),
    admin.from("slot_requests").select("status").in("channel_id", channelIds),
    admin.from("points_ledger").select("points_delta").in("channel_id", channelIds),
    admin.from("transactions").select("tx_type,amount").in("channel_id", channelIds)
  ]);

  const overlayIds = (overlays ?? []).map((o) => o.id as string);
  const widgetsEnabledRes = overlayIds.length
    ? await admin.from("widget_instances").select("*", { count: "exact", head: true }).in("overlay_id", overlayIds).eq("is_enabled", true)
    : { count: 0 };

  const widgetTypeRows = await admin
    .from("widget_events")
    .select("widget_type")
    .in("channel_id", channelIds)
    .gte("created_at", since7d)
    .limit(2000);

  const topWidgetMap = new Map<string, number>();
  for (const row of widgetTypeRows.data ?? []) {
    const t = String(row.widget_type ?? "unknown");
    topWidgetMap.set(t, (topWidgetMap.get(t) ?? 0) + 1);
  }
  const topWidgets = [...topWidgetMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  const openRequests = (requests ?? []).filter((r) => r.status === "open").length;
  const pointsGranted = (points ?? []).reduce((sum, p) => sum + Math.max(0, Number(p.points_delta) || 0), 0);
  const totalDeposits = (txs ?? []).filter((t) => t.tx_type === "deposit").reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const totalWithdrawals = (txs ?? []).filter((t) => t.tx_type === "withdrawal").reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const publishedOverlays = (overlays ?? []).filter((o) => Boolean(o.is_published)).length;

  return (
    <DashboardShell>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-black text-text">Home</h1>
          <p className="text-sm text-subtle mt-1">Live operational stats from your real widget and channel data.</p>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-panelMuted bg-panel p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-subtle/70">Overlays</p>
            <p className="mt-2 text-2xl font-black text-text">{formatInt(overlaysCountRes.count ?? 0)}</p>
            <p className="mt-1 text-xs text-subtle">{formatInt(publishedOverlays)} published</p>
          </div>
          <div className="rounded-xl border border-panelMuted bg-panel p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-subtle/70">Active Widgets</p>
            <p className="mt-2 text-2xl font-black text-text">{formatInt(widgetsEnabledRes.count ?? 0)}</p>
            <p className="mt-1 text-xs text-subtle">Enabled widget instances</p>
          </div>
          <div className="rounded-xl border border-panelMuted bg-panel p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-subtle/70">Widget Events (24h)</p>
            <p className="mt-2 text-2xl font-black text-text">{formatInt(events24hRes.count ?? 0)}</p>
            <p className="mt-1 text-xs text-subtle">From `widget_events`</p>
          </div>
          <div className="rounded-xl border border-panelMuted bg-panel p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-subtle/70">Open Slot Requests</p>
            <p className="mt-2 text-2xl font-black text-text">{formatInt(openRequests)}</p>
            <p className="mt-1 text-xs text-subtle">From `slot_requests`</p>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-panelMuted bg-panel p-4">
            <h2 className="text-sm font-semibold text-text">Financial Snapshot</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-panelMuted bg-bg/40 p-3">
                <p className="text-[11px] uppercase tracking-[0.12em] text-subtle/70">Total Deposits</p>
                <p className="mt-1 text-lg font-black text-emerald-300">{formatCurrency(totalDeposits)}</p>
              </div>
              <div className="rounded-lg border border-panelMuted bg-bg/40 p-3">
                <p className="text-[11px] uppercase tracking-[0.12em] text-subtle/70">Total Withdrawals</p>
                <p className="mt-1 text-lg font-black text-rose-300">{formatCurrency(totalWithdrawals)}</p>
              </div>
            </div>
            <div className="mt-3 rounded-lg border border-panelMuted bg-bg/40 p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-subtle/70">Points Granted</p>
              <p className="mt-1 text-lg font-black text-accent">{formatInt(pointsGranted)}</p>
            </div>
          </div>

          <div className="rounded-xl border border-panelMuted bg-panel p-4">
            <h2 className="text-sm font-semibold text-text">Top Widget Activity (7d)</h2>
            {topWidgets.length === 0 ? (
              <p className="mt-4 text-xs text-subtle">No widget activity in the last 7 days.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {topWidgets.map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between rounded-lg border border-panelMuted bg-bg/40 px-3 py-2">
                    <span className="text-sm text-text">{type}</span>
                    <span className="text-xs font-mono text-subtle">{formatInt(count)} events</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-panelMuted bg-panel p-4">
          <h2 className="text-sm font-semibold text-text">Recent Widget Events</h2>
          {!recentEvents?.length ? (
            <p className="mt-3 text-xs text-subtle">No recent widget events.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {recentEvents.map((e, idx) => (
                <div key={`${e.created_at}-${idx}`} className="flex items-center justify-between rounded-lg border border-panelMuted bg-bg/40 px-3 py-2">
                  <div>
                    <p className="text-sm text-text">{String(e.widget_type)} - {String(e.event_type)}</p>
                    <p className="text-[11px] text-subtle">{formatDate(String(e.created_at))}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}

