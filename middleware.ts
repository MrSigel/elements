import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/home", "/overlays", "/overlay-preview", "/widgets", "/bot", "/website", "/frontpages", "/moderation", "/shop", "/logs", "/onboarding"];
const ADMIN_PREFIX = "/admin";

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/"
};

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isAdmin(pathname: string) {
  return pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`);
}

async function hasValidToken(accessToken: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return false;

  const res = await fetch(`${url}/auth/v1/user`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: anonKey
    }
  });

  return res.ok;
}

type RefreshedSession = { access_token: string; refresh_token: string; expires_in: number } | null;

async function refreshSession(refreshToken: string): Promise<RefreshedSession> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const res = await fetch(`${url}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: anonKey },
    body: JSON.stringify({ refresh_token: refreshToken })
  });

  if (!res.ok) return null;
  const data = await res.json() as { access_token?: string; refresh_token?: string; expires_in?: number };
  if (!data.access_token || !data.refresh_token) return null;
  return { access_token: data.access_token, refresh_token: data.refresh_token, expires_in: data.expires_in ?? 3600 };
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Admin route protection — check admin-token cookie presence
  if (isAdmin(pathname)) {
    const adminToken = req.cookies.get("admin-token")?.value;
    if (!adminToken) {
      const url = new URL("/auth", req.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (!isProtected(pathname)) {
    return NextResponse.next();
  }

  if (process.env.NODE_ENV !== "production") {
    const testAuth = req.cookies.get("dev-test-auth")?.value;
    if (testAuth === "1") {
      return NextResponse.next();
    }
  }

  const accessToken = req.cookies.get("sb-access-token")?.value;
  if (accessToken && (await hasValidToken(accessToken))) {
    return NextResponse.next();
  }

  // Access token missing or expired — try refreshing with the refresh token
  const refreshToken = req.cookies.get("sb-refresh-token")?.value;
  if (refreshToken) {
    const session = await refreshSession(refreshToken);
    if (session) {
      const res = NextResponse.next();
      res.cookies.set("sb-access-token", session.access_token, { ...COOKIE_OPTS, maxAge: session.expires_in });
      res.cookies.set("sb-refresh-token", session.refresh_token, { ...COOKIE_OPTS, maxAge: 60 * 60 * 24 * 30 });
      return res;
    }
  }

  const url = new URL("/auth", req.url);
  const nextTarget = `${pathname}${req.nextUrl.search}`;
  url.searchParams.set("next", nextTarget);
  const res = NextResponse.redirect(url);
  res.cookies.set("sb-access-token", "", { maxAge: 0, path: "/" });
  res.cookies.set("sb-refresh-token", "", { maxAge: 0, path: "/" });
  return res;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/overlays/:path*",
    "/home/:path*",
    "/overlay-preview/:path*",
    "/widgets/:path*",
    "/bot/:path*",
    "/website/:path*",
    "/frontpages/:path*",
    "/moderation/:path*",
    "/shop/:path*",
    "/logs/:path*",
    "/onboarding/:path*"
  ]
};
