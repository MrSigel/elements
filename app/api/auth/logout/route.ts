import { NextResponse } from "next/server";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/"
};

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("sb-access-token", "", { ...COOKIE_OPTIONS, maxAge: 0 });
  res.cookies.set("sb-refresh-token", "", { ...COOKIE_OPTIONS, maxAge: 0 });
  return res;
}
