import { createServiceClient } from "@/lib/supabase/server";

export async function getAccessibleChannelIds(userId: string) {
  const admin = createServiceClient();
  const [{ data: owned }, { data: roles }] = await Promise.all([
    admin.from("channels").select("id").eq("owner_id", userId),
    admin.from("channel_roles").select("channel_id").eq("user_id", userId)
  ]);

  const ids = new Set<string>();
  for (const c of owned ?? []) ids.add(c.id as string);
  for (const r of roles ?? []) ids.add(r.channel_id as string);
  return [...ids];
}

