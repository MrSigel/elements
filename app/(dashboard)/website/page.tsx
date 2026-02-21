import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { WebsiteBuilder } from "@/components/forms/WebsiteBuilder";

export default function WebsitePage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Website</h2>
        <p className="text-sm text-subtle">Edit your landing page content and preview it live (reference direction: diegawinos.com).</p>

        <WebsiteBuilder />

        <section className="rounded-xl border border-panelMuted bg-panel p-5">
          <h3 className="text-lg font-semibold mb-2">Current Playing Auto-Tracking</h3>
          <p className="text-sm text-subtle">
            You do not need to enter the current slot manually if your extension is connected. It can be updated automatically through ingest.
          </p>
        </section>
      </div>
    </DashboardShell>
  );
}
