import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { DomainSettings } from "@/components/forms/DomainSettings";

const PLAN_META: Record<string, { label: string; color: string }> = {
  starter:    { label: "Starter",    color: "bg-panelMuted text-subtle" },
  pro:        { label: "Pro",        color: "bg-accent/10 text-accent border border-accent/25" },
  enterprise: { label: "Enterprise", color: "bg-purple-500/10 text-purple-300 border border-purple-500/25" },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SettingsPage() {
  const userClient = await createServerClient();
  const { data: auth } = await userClient.auth.getUser();

  let plan = "starter";
  let expiresAt: string | null = null;
  let currentDomain: string | null = null;
  let channelSlug: string | null = null;

  if (auth.user) {
    const admin = createServiceClient();
    const { data: channel } = await admin
      .from("channels")
      .select("subscription_plan, subscription_expires_at, custom_domain, slug")
      .eq("owner_id", auth.user.id)
      .limit(1)
      .maybeSingle();
    if (channel) {
      plan = (channel as any).subscription_plan ?? "starter";
      expiresAt = (channel as any).subscription_expires_at ?? null;
      currentDomain = (channel as any).custom_domain ?? null;
      channelSlug = (channel as any).slug ?? null;
    }
  }

  const appHost = new URL(env.NEXT_PUBLIC_APP_URL).hostname;
  const publicUrl = channelSlug ? `${env.NEXT_PUBLIC_APP_URL}/c/${channelSlug}` : null;

  const meta = PLAN_META[plan] ?? PLAN_META.starter;
  const expiry = expiresAt ? new Date(expiresAt) : null;

  return (
    <DashboardShell>
      <div className="space-y-6 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-text">Settings</h1>
            <p className="text-sm text-subtle mt-1">Account integrations and application settings.</p>
          </div>
          <div className="text-right flex-shrink-0">
            <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${meta.color}`}>
              {meta.label}
            </span>
            {expiry && plan !== "starter" && (
              <p className="text-[10px] text-subtle mt-1">
                Active until {expiry.toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        <section className="rounded-xl border border-panelMuted bg-panel p-5 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-text">Connected Accounts</h2>
            <p className="text-xs text-subtle mt-0.5">
              Optional integrations. Your account works fully without Twitch or Discord.
            </p>
          </div>

          <div className="max-w-sm">
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
              {/* Use plain <a> — Next.js Link would prefetch this as RSC, causing a CORS error with Twitch's OAuth redirect */}
              <a
                href="/api/auth/twitch/start"
                className="inline-flex items-center justify-center w-full rounded-lg border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent hover:bg-accent/20 transition-colors"
              >
                Connect Twitch
              </a>
            </div>
          </div>
        </section>

        <DomainSettings
          initialDomain={currentDomain}
          appHost={appHost}
          publicUrl={publicUrl}
        />
      </div>
    </DashboardShell>
  );
}
