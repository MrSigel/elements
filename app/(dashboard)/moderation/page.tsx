import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ModInviteForm } from "@/components/forms/ModInviteForm";
import { PermissionMatrix } from "@/components/forms/PermissionMatrix";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ModerationPage() {
  const admin = createServiceClient();
  const [{ data: channels }, { data: roles }, { data: permissions }, { data: overlays }, { data: widgets }] = await Promise.all([
    admin.from("channels").select("id,title").order("created_at", { ascending: false }),
    admin.from("channel_roles").select("id,channel_id,user_id,role,users(twitch_login,twitch_display_name)").order("created_at", { ascending: false }),
    admin.from("permissions").select("id,channel_role_id,permission_key,overlay_id,widget_instance_id"),
    admin.from("overlays").select("id,name").order("created_at", { ascending: false }),
    admin.from("widget_instances").select("id,name,overlay_id").order("created_at", { ascending: false })
  ]);

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

