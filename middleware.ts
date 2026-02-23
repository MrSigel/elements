import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/overlays", "/overlay-preview", "/widgets", "/website", "/frontpages", "/moderation", "/logs", "/settings", "/onboarding"];

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
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

export async function middleware(req: NextRequest) {
  if (!isProtected(req.nextUrl.pathname)) {
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

  const url = new URL("/auth", req.url);
  const nextTarget = `${req.nextUrl.pathname}${req.nextUrl.search}`;
  url.searchParams.set("next", nextTarget);
  const res = NextResponse.redirect(url);
  if (accessToken) {
    res.cookies.set("sb-access-token", "", { maxAge: 0, path: "/" });
    res.cookies.set("sb-refresh-token", "", { maxAge: 0, path: "/" });
  }
  return res;
}

export const config = {
  matcher: [
    "/overlays/:path*",
    "/overlay-preview/:path*",
    "/widgets/:path*",
    "/website/:path*",
    "/frontpages/:path*",
    "/moderation/:path*",
    "/logs/:path*",
    "/settings/:path*",
    "/onboarding/:path*"
  ]
};
