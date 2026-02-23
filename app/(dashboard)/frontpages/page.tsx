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
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-black text-text">Viewer Pages</h1>
          <p className="text-sm text-subtle mt-1">Create public viewer pages your chat can open during a stream — bonus hunt trackers, tournament scoreboards, slot request lists, and more.</p>
        </div>
        <FrontpageManager overlays={overlays ?? []} pages={(pages ?? []) as never[]} />
      </div>
    </DashboardShell>
  );
}

