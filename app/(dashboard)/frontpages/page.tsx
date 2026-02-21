import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { FrontpageManager } from "@/components/forms/FrontpageManager";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import { getAccessibleChannelIds } from "@/lib/dashboard-scope";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FrontpagesPage() {
  const userClient = await createServerClient();
  const { data: auth } = await userClient.auth.getUser();
  if (!auth.user) {
    return (
      <DashboardShell>
        <p className="text-subtle">Unauthorized.</p>
      </DashboardShell>
    );
  }

  const channelIds = await getAccessibleChannelIds(auth.user.id);
  const admin = createServiceClient();
  const [{ data: pages }, { data: overlays }] = channelIds.length
    ? await Promise.all([
        admin.from("viewer_pages").select("id,page_type,enabled,viewer_tokens(public_token)").in("channel_id", channelIds).order("created_at", { ascending: false }),
        admin.from("overlays").select("id,name").in("channel_id", channelIds).order("created_at", { ascending: false })
      ])
    : [{ data: [] as never[] }, { data: [] as never[] }];

  return (
    <DashboardShell>
      <h2 className="text-2xl font-semibold mb-6">Frontpages Manager</h2>
      <FrontpageManager overlays={overlays ?? []} pages={(pages ?? []) as never[]} />
    </DashboardShell>
  );
}

