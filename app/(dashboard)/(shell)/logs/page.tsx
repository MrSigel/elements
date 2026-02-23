import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import { getAccessibleChannelIds } from "@/lib/dashboard-scope";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "medium" });
  } catch {
    return iso;
  }
}

function formatEvent(widgetType: string, eventType: string) {
  const fmt = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return `${fmt(widgetType)} — ${fmt(eventType)}`;
}

export default async function LogsPage() {
  const userClient = await createServerClient();
  const { data: auth } = await userClient.auth.getUser();
  if (!auth.user) {
    return <p className="text-subtle p-6">Unauthorized.</p>;
  }

  const channelIds = await getAccessibleChannelIds(auth.user.id);
  const admin = createServiceClient();
  const [{ data: logs }, { data: events }] = channelIds.length
    ? await Promise.all([
        admin.from("audit_logs").select("action,created_at,metadata").in("channel_id", channelIds).order("created_at", { ascending: false }).limit(100),
        admin.from("widget_events").select("event_type,widget_type,created_at,payload").in("channel_id", channelIds).order("created_at", { ascending: false }).limit(100)
      ])
    : [{ data: [] as never[] }, { data: [] as never[] }];

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text">Logs</h1>
          <p className="text-sm text-subtle mt-1">Audit trail of all actions and widget events on your channel.</p>
        </div>
        <a
          href="/api/logs/export"
          download
          className="inline-flex items-center gap-1.5 rounded-lg bg-panelMuted px-3 py-2 text-xs font-medium hover:bg-panelMuted/80 transition-colors flex-shrink-0"
        >
          Export CSV ↓
        </a>
      </div>

      {/* Audit logs */}
      <section>
        <h2 className="text-sm font-semibold text-text mb-3">Audit Trail</h2>
        {!logs?.length ? (
          <div className="rounded-lg border border-panelMuted bg-panel p-6 text-center">
            <p className="text-xs text-subtle">No audit activity yet.</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {logs.map((l, idx) => (
              <div key={idx} className="rounded-md border border-panelMuted bg-panel px-4 py-2.5 text-sm flex items-center gap-4">
                <span className="font-mono text-xs text-subtle/60 flex-shrink-0 w-36">{formatDate(l.created_at)}</span>
                <span className="text-text">{l.action}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Widget events */}
      <section>
        <h2 className="text-sm font-semibold text-text mb-3">Widget Events</h2>
        {!events?.length ? (
          <div className="rounded-lg border border-panelMuted bg-panel p-6 text-center">
            <p className="text-xs text-subtle">No widget events yet.</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {events.map((e, idx) => (
              <div key={idx} className="rounded-md border border-panelMuted bg-panel px-4 py-2.5 text-sm flex items-center gap-4">
                <span className="font-mono text-xs text-subtle/60 flex-shrink-0 w-36">{formatDate(e.created_at)}</span>
                <span className="text-text">{formatEvent(e.widget_type, e.event_type)}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
