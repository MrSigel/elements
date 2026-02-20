import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { createServiceClient } from "@/lib/supabase/server";

export default async function LogsPage() {
  const admin = createServiceClient();
  const [{ data: logs }, { data: events }] = await Promise.all([
    admin.from("audit_logs").select("action,created_at,metadata").order("created_at", { ascending: false }).limit(100),
    admin.from("widget_events").select("event_type,widget_type,created_at,payload").order("created_at", { ascending: false }).limit(100)
  ]);

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Logs & Audit</h2>
          <Link href="/api/logs/export" className="rounded bg-panelMuted px-3 py-2">Export CSV</Link>
        </div>
        <section>
          <h3 className="text-lg font-medium mb-2">Audit</h3>
          <div className="space-y-2">
            {logs?.map((l, idx) => (
              <div key={idx} className="rounded-md border border-panelMuted bg-panel p-3 text-sm">
                <span className="font-mono text-subtle">{new Date(l.created_at).toISOString()}</span> {l.action}
              </div>
            ))}
          </div>
        </section>
        <section>
          <h3 className="text-lg font-medium mb-2">Widget Events</h3>
          <div className="space-y-2">
            {events?.map((e, idx) => (
              <div key={idx} className="rounded-md border border-panelMuted bg-panel p-3 text-sm">
                <span className="font-mono text-subtle">{new Date(e.created_at).toISOString()}</span> {e.widget_type}.{e.event_type}
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}

