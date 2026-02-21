import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default function WebsitePage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Website</h2>
        <p className="text-sm text-subtle">
          Build your own landing page for your brand (reference style: diegawinos.com). This area is for website content, sections, offers and links.
        </p>

        <section className="rounded-xl border border-panelMuted bg-panel p-5 space-y-3">
          <h3 className="text-lg font-semibold">Landing Page Builder</h3>
          <p className="text-sm text-subtle">
            Configure hero, offers, feature cards and CTA blocks. The publishing workflow can be connected here next.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-panelMuted bg-panelMuted/40 p-3">
              <p className="font-medium">Hero Section</p>
              <p className="text-xs text-subtle">Headline, subtext, CTA and media.</p>
            </div>
            <div className="rounded-lg border border-panelMuted bg-panelMuted/40 p-3">
              <p className="font-medium">Offers / Promotions</p>
              <p className="text-xs text-subtle">Add your current casino offers and links.</p>
            </div>
            <div className="rounded-lg border border-panelMuted bg-panelMuted/40 p-3">
              <p className="font-medium">Feature Highlights</p>
              <p className="text-xs text-subtle">Show bonushunt, tournaments and widgets.</p>
            </div>
            <div className="rounded-lg border border-panelMuted bg-panelMuted/40 p-3">
              <p className="font-medium">Call to Action</p>
              <p className="text-xs text-subtle">Drive traffic to overlays, frontpages and socials.</p>
            </div>
          </div>
        </section>

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

