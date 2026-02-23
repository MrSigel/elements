import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AuthGateway } from "@/components/auth/AuthGateway";
import { createServerClient } from "@/lib/supabase/server";

type AuthPageProps = {
  searchParams?: Promise<{ next?: string | string[] }>;
};

function sanitizeNext(nextPath: string | undefined) {
  if (!nextPath || !nextPath.startsWith("/")) return "/home";
  if (nextPath.startsWith("/auth")) return "/home";
  return nextPath;
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const resolvedSearchParams = await searchParams;
  const rawNext = Array.isArray(resolvedSearchParams?.next) ? resolvedSearchParams?.next[0] : resolvedSearchParams?.next;
  const nextPath = sanitizeNext(rawNext);
  const client = await createServerClient();
  const { data } = await client.auth.getUser();
  const cookieStore = await cookies();
  const isTestLoggedIn = cookieStore.get("dev-test-auth")?.value === "1";

  if (data.user || isTestLoggedIn) {
    redirect(nextPath);
  }

  return <AuthGateway nextPath={nextPath} />;
}

