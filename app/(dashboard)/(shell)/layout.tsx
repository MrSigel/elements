import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ShellLayout({ children }: { children: React.ReactNode }) {
  const userClient = await createServerClient();
  const { data: auth } = await userClient.auth.getUser();

  let twitchLogin: string | null = null;
  let twitchDisplayName: string | null = null;
  let isTwitchConnected = false;

  if (auth.user) {
    const admin = createServiceClient();
    const { data: user } = await admin
      .from("users")
      .select("twitch_login,twitch_display_name,twitch_user_id")
      .eq("id", auth.user.id)
      .maybeSingle();

    // A real Twitch connection has a numeric twitch_user_id (not the auth UUID placeholder)
    isTwitchConnected = !!(user?.twitch_user_id && user.twitch_user_id !== auth.user.id);
    twitchLogin = isTwitchConnected ? (user?.twitch_login ?? null) : null;
    twitchDisplayName = isTwitchConnected ? (user?.twitch_display_name ?? null) : null;
  }

  return (
    <DashboardShell
      userId={auth.user?.id}
      twitchLogin={twitchLogin}
      twitchDisplayName={twitchDisplayName}
      isTwitchConnected={isTwitchConnected}
    >
      {children}
    </DashboardShell>
  );
}
