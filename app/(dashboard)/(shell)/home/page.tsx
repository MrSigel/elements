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

function StatCard({ label, value, sub, accent, icon }: { label: string; value: string; sub: string; accent?: boolean; icon: React.ReactNode }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-5 flex flex-col gap-3 ${accent ? "border-accent/20 bg-gradient-to-br from-accent/[0.07] to-panel" : "border-white/[0.07] bg-gradient-to-br from-panel to-bg-deep/60"}`}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-subtle/60">{label}</p>
        <span className={`p-2 rounded-xl ${accent ? "bg-accent/15 text-accent" : "bg-white/[0.05] text-subtle/50"}`}>{icon}</span>
      </div>
      <div>
        <p className={`text-3xl font-black ${accent ? "text-accent" : "text-text"}`}>{value}</p>
        <p className="text-xs text-subtle/50 mt-1">{sub}</p>
      </div>
    </div>
  );
}

export default async function DashboardHomePage() {
  const userClient = await createServerClient();
  const { data: auth } = await userClient.auth.getUser();
  if (!auth.user) {
    return <p className="text-subtle p-6">Unauthorized.</p>;
  }

  const channelIds = await getAccessibleChannelIds(auth.user.id);
  const admin = createServiceClient();

  if (!channelIds.length) {
    return (
      <div className="p-8 max-w-lg">
        <h1 className="text-2xl font-black text-text">Home</h1>
        <p className="text-sm text-subtle mt-1">No channel found yet. Create your first overlay to start collecting live statistics.</p>
      </div>
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
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-black text-text">Home</h1>
        <p className="text-sm text-subtle mt-1">Live operational stats from your real widget and channel data.</p>
      </div>

      {/* Stat cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Overlays"
          value={formatInt(overlaysCountRes.count ?? 0)}
          sub={`${formatInt(publishedOverlays)} published`}
          icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="5" width="13" height="9.5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><rect x="3.5" y="2" width="9" height="2" rx="1" stroke="currentColor" strokeWidth="1.4"/></svg>}
        />
        <StatCard
          label="Active Widgets"
          value={formatInt(widgetsEnabledRes.count ?? 0)}
          sub="Enabled instances"
          icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.4"/><rect x="9" y="1.5" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.4"/><rect x="1.5" y="9" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.4"/><rect x="9" y="9" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.4"/></svg>}
        />
        <StatCard
          label="Events (24h)"
          value={formatInt(events24hRes.count ?? 0)}
          sub="Widget events today"
          accent
          icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1L10 6H15L11 9.5L12.5 14.5L8 11.5L3.5 14.5L5 9.5L1 6H6L8 1Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>}
        />
        <StatCard
          label="Open Requests"
          value={formatInt(openRequests)}
          sub="Pending slot requests"
          icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4.5H12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M4 8H12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M4 11.5H8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>}
        />
      </section>

      {/* Middle row: Financial + Top widgets */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-panel to-bg-deep/60 p-5 space-y-3">
          <h2 className="text-sm font-bold text-text">Financial Snapshot</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.05] p-3">
              <p className="text-[10px] uppercase tracking-[0.12em] text-emerald-400/70 font-bold">Deposits</p>
              <p className="mt-1.5 text-lg font-black text-emerald-300">{formatCurrency(totalDeposits)}</p>
            </div>
            <div className="rounded-xl border border-rose-500/15 bg-rose-500/[0.05] p-3">
              <p className="text-[10px] uppercase tracking-[0.12em] text-rose-400/70 font-bold">Withdrawals</p>
              <p className="mt-1.5 text-lg font-black text-rose-300">{formatCurrency(totalWithdrawals)}</p>
            </div>
          </div>
          <div className="rounded-xl border border-accent/15 bg-accent/[0.06] p-3">
            <p className="text-[10px] uppercase tracking-[0.12em] text-accent/70 font-bold">Points Granted</p>
            <p className="mt-1.5 text-lg font-black text-accent">{formatInt(pointsGranted)}</p>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-white/[0.07] bg-gradient-to-br from-panel to-bg-deep/60 p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-text">Top Widget Activity</h2>
            <span className="text-[10px] text-subtle/40 uppercase tracking-wide">Last 7 days</span>
          </div>
          {topWidgets.length === 0 ? (
            <p className="text-xs text-subtle/40 italic">No widget activity in the last 7 days.</p>
          ) : (
            <div className="space-y-3">
              {topWidgets.map(([type, count], i) => {
                const maxCount = topWidgets[0][1];
                const pct = Math.round((count / maxCount) * 100);
                return (
                  <div key={type} className="flex items-center gap-3">
                    <span className="text-[10px] text-subtle/30 w-4 text-right font-mono flex-shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-text capitalize truncate">{type.replace(/_/g, " ")}</span>
                        <span className="text-[10px] font-mono text-subtle/50 ml-2 flex-shrink-0">{formatInt(count)}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-accent/70 to-accent/40" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Recent events */}
      <section className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-panel to-bg-deep/60 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-text">Recent Widget Events</h2>
          <span className="text-[10px] text-subtle/40 uppercase tracking-wide">Last 20</span>
        </div>
        {!recentEvents?.length ? (
          <p className="text-xs text-subtle/40 italic">No recent widget events.</p>
        ) : (
          <div className="space-y-1.5">
            {recentEvents.map((e, idx) => (
              <div key={`${e.created_at}-${idx}`} className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.035] transition-colors px-3 py-2.5">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent/50 flex-shrink-0" />
                  <p className="text-xs text-text capitalize truncate">
                    {String(e.widget_type).replace(/_/g, " ")}
                    <span className="text-subtle/40 mx-1.5">·</span>
                    <span className="text-subtle/70">{String(e.event_type).replace(/_/g, " ")}</span>
                  </p>
                </div>
                <p className="text-[10px] text-subtle/35 flex-shrink-0 ml-3 font-mono">{formatDate(String(e.created_at))}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
