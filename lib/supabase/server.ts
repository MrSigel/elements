import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

export function createServerClient() {
  const cookieStore = cookies() as any;
  const token = cookieStore?.get?.("sb-access-token")?.value ?? "";

  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: token ? `Bearer ${token}` : ""
      }
    },
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

export function createServiceClient() {
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}
