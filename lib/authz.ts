import { createServiceClient } from "@/lib/supabase/server";

export class AuthzError extends Error {
  status: number;
  constructor(message: string, status = 403) {
    super(message);
    this.status = status;
  }
}

async function isOwner(admin: ReturnType<typeof createServiceClient>, userId: string, channelId: string) {
  const { data } = await admin.from("channels").select("id").eq("id", channelId).eq("owner_id", userId).maybeSingle();
  return Boolean(data);
}

async function findModRole(admin: ReturnType<typeof createServiceClient>, userId: string, channelId: string) {
  const { data } = await admin.from("channel_roles").select("id,role").eq("channel_id", channelId).eq("user_id", userId).maybeSingle();
  return data;
}

async function modHasPermission(
  admin: ReturnType<typeof createServiceClient>,
  roleId: string,
  permissionKey: string,
  overlayId?: string,
  widgetInstanceId?: string
) {
  const query = admin
    .from("permissions")
    .select("id")
    .eq("channel_role_id", roleId)
    .eq("permission_key", permissionKey)
    .or(`overlay_id.is.null,overlay_id.eq.${overlayId ?? "00000000-0000-0000-0000-000000000000"}`)
    .limit(1);

  const { data } = await query;
  if (!data || data.length === 0) return false;

  if (!widgetInstanceId) return true;
  const { data: widgetScoped } = await admin
    .from("permissions")
    .select("id")
    .eq("channel_role_id", roleId)
    .eq("permission_key", permissionKey)
    .or(`widget_instance_id.is.null,widget_instance_id.eq.${widgetInstanceId}`)
    .limit(1);
  return Boolean(widgetScoped && widgetScoped.length > 0);
}

export async function requireChannelPermission(args: {
  userId: string;
  channelId: string;
  permissionKey: string;
  overlayId?: string;
  widgetInstanceId?: string;
}) {
  const admin = createServiceClient();

  if (await isOwner(admin, args.userId, args.channelId)) return { role: "owner" as const };

  const modRole = await findModRole(admin, args.userId, args.channelId);
  if (!modRole || modRole.role !== "moderator") throw new AuthzError("forbidden", 403);

  const allowed = await modHasPermission(admin, modRole.id, args.permissionKey, args.overlayId, args.widgetInstanceId);
  if (!allowed) throw new AuthzError("missing_permission", 403);

  return { role: "moderator" as const, roleId: modRole.id };
}

export async function getOverlayChannelId(overlayId: string) {
  const admin = createServiceClient();
  const { data } = await admin.from("overlays").select("channel_id").eq("id", overlayId).maybeSingle();
  if (!data) throw new AuthzError("overlay_not_found", 404);
  return data.channel_id;
}

