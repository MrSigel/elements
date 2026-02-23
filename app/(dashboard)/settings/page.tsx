import { DashboardShell } from "@/components/dashboard/DashboardShell";
import Link from "next/link";

export default function SettingsPage() {
  return (
    <DashboardShell>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-black text-text">Settings</h1>
          <p className="text-sm text-subtle mt-1">Account integrations and application settings.</p>
        </div>

        <section className="rounded-xl border border-panelMuted bg-panel p-5 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-text">Connected Accounts</h2>
            <p className="text-xs text-subtle mt-0.5">
              Optional integrations. Your account works fully without Twitch or Discord.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Twitch */}
            <div className="rounded-lg border border-panelMuted bg-bg/40 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#9146ff"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>
                <p className="text-sm font-semibold text-text">Twitch</p>
              </div>
              <ul className="text-xs text-subtle space-y-1">
                <li className="flex items-start gap-1.5"><span className="text-accent mt-0.5">•</span>Allows the chat bot to send messages in your Twitch channel</li>
                <li className="flex items-start gap-1.5"><span className="text-accent mt-0.5">•</span>Links your Twitch identity to your overlays and viewer pages</li>
                <li className="flex items-start gap-1.5"><span className="text-accent mt-0.5">•</span>Enables automated hunt tracking and chat commands</li>
              </ul>
              <Link
                href="/api/auth/twitch/start"
                className="inline-flex items-center justify-center w-full rounded-lg border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent hover:bg-accent/20 transition-colors"
              >
                Connect Twitch
              </Link>
            </div>

            {/* Discord */}
            <div className="rounded-lg border border-panelMuted bg-bg/40 p-4 space-y-3 opacity-60">
              <div className="flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#5865f2"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z"/></svg>
                <p className="text-sm font-semibold text-text">Discord</p>
              </div>
              <ul className="text-xs text-subtle space-y-1">
                <li className="flex items-start gap-1.5"><span className="text-subtle/50 mt-0.5">•</span>Discord integration coming soon</li>
              </ul>
              <button
                type="button"
                disabled
                className="w-full rounded-lg border border-panelMuted bg-panelMuted/50 px-4 py-2 text-sm font-semibold text-subtle cursor-not-allowed"
              >
                Coming Soon
              </button>
            </div>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
