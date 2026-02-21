import { DashboardShell } from "@/components/dashboard/DashboardShell";
import Link from "next/link";

export default function SettingsPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Settings</h2>

        <section className="rounded-xl border border-accent/20 bg-accent/5 p-5">
          <h3 className="text-lg font-semibold mb-1">Connected Accounts</h3>
          <p className="text-sm text-subtle mb-4">
            Optional integrations. Your account works fully without Twitch or Discord connection.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/api/auth/twitch/start"
              className="rounded-lg border border-accent/25 bg-bg/40 px-4 py-3 text-sm font-medium hover:border-accent/45 transition-colors duration-300 text-center"
            >
              Connect Twitch
            </Link>
            <button
              type="button"
              disabled
              className="rounded-lg border border-accent/15 bg-bg/40 px-4 py-3 text-sm font-medium text-subtle/70 cursor-not-allowed"
            >
              Connect Discord (Soon)
            </button>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}

