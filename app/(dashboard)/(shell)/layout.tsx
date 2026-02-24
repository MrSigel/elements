import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { createServerClient } from "@/lib/supabase/server";

export default async function ShellLayout({ children }: { children: React.ReactNode }) {
  const userClient = await createServerClient();
  const { data: auth } = await userClient.auth.getUser();
  return <DashboardShell userId={auth.user?.id}>{children}</DashboardShell>;
}
