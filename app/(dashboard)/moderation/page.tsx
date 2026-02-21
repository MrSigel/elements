import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ModInviteForm } from "@/components/forms/ModInviteForm";
import { PermissionMatrix } from "@/components/forms/PermissionMatrix";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import { getAccessibleChannelIds } from "@/lib/dashboard-scope";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ModerationPage() {
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
  const [{ data: channels }, { data: roles }, { data: overlays }] = channelIds.length
    ? await Promise.all([
        admin.from("channels").select("id,title").in("id", channelIds).order("created_at", { ascending: false }),
        admin.from("channel_roles").select("id,channel_id,user_id,role,users(twitch_login,twitch_display_name)").in("channel_id", channelIds).order("created_at", { ascending: false }),
        admin.from("overlays").select("id,name,channel_id").in("channel_id", channelIds).order("created_at", { ascending: false })
      ])
    : [{ data: [] as never[] }, { data: [] as never[] }, { data: [] as never[] }];

  const overlayIds = (overlays ?? []).map((o: any) => o.id);
  const [{ data: permissions }, { data: widgets }] = overlayIds.length
    ? await Promise.all([
        admin.from("permissions").select("id,channel_role_id,permission_key,overlay_id,widget_instance_id").in("overlay_id", overlayIds),
        admin.from("widget_instances").select("id,name,overlay_id").in("overlay_id", overlayIds).order("created_at", { ascending: false })
      ])
    : [{ data: [] as never[] }, { data: [] as never[] }];

  return (
    <DashboardShell>
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Moderation Center</h2>
        <ModInviteForm channels={channels ?? []} />
        <PermissionMatrix roles={(roles ?? []) as never[]} permissions={(permissions ?? []) as never[]} overlays={overlays ?? []} widgets={widgets ?? []} />
        <Link href="/api/logs/export" className="inline-block rounded bg-panelMuted px-3 py-2">Export Audit CSV</Link>
      </div>
    </DashboardShell>
  );
}

