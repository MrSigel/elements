import { NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import { AuthzError, requireChannelPermission } from "@/lib/authz";
import { safeCsvCell } from "@/lib/security";

export async function GET() {
  const userClient = createServerClient();
  const { data: auth } = await userClient.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const admin = createServiceClient();
  const { data: channels } = await admin.from("channels").select("id").or(`owner_id.eq.${auth.user.id},id.in.(select channel_id from channel_roles where user_id='${auth.user.id}')`);
  const channelIds = (channels ?? []).map((c) => c.id);
  if (channelIds.length === 0) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  try {
    await requireChannelPermission({ userId: auth.user.id, channelId: channelIds[0], permissionKey: "logs_export" });
    const { data: logs } = await admin.from("audit_logs").select("action,created_at,metadata,actor_id,channel_id").in("channel_id", channelIds).order("created_at", { ascending: false }).limit(1000);

    const header = "created_at,channel_id,actor_id,action,metadata";
    const lines = (logs ?? []).map((l) => [new Date(l.created_at).toISOString(), l.channel_id, l.actor_id ?? "", l.action, JSON.stringify(l.metadata)].map(safeCsvCell).join(","));
    return new NextResponse([header, ...lines].join("\n"), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=audit_logs.csv" } });
  } catch (error) {
    if (error instanceof AuthzError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "failed" }, { status: 400 });
  }
}


