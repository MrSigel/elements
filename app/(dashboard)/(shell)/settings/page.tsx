import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { DomainSettings } from "@/components/forms/DomainSettings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SettingsPage() {
  const userClient = await createServerClient();
  const { data: auth } = await userClient.auth.getUser();
  const admin = createServiceClient();

  let currentDomain: string | null = null;
  let channelSlug: string | null = null;

  if (auth.user?.id) {
    const { data: channel } = await admin
      .from("channels")
      .select("slug, custom_domain")
      .eq("owner_id", auth.user.id)
      .limit(1)
      .maybeSingle();
    currentDomain = channel?.custom_domain ?? null;
    channelSlug = channel?.slug ?? null;
  }

  const appHost = new URL(env.NEXT_PUBLIC_APP_URL).hostname;
  const publicUrl = channelSlug ? `${env.NEXT_PUBLIC_APP_URL}/c/${channelSlug}` : null;

  return (
    <div className="space-y-6 p-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-text">Settings</h1>
        <p className="text-sm text-subtle mt-1">Manage your account and channel configuration.</p>
      </div>

      <DomainSettings
        initialDomain={currentDomain}
        appHost={appHost}
        publicUrl={publicUrl}
      />
    </div>
  );
}
