import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/"
};

export async function POST(req: NextRequest) {
  let parsedInput: z.infer<typeof loginSchema>;
  try {
    parsedInput = loginSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid_login_payload" }, { status: 400 });
  }

  const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const signedIn = await client.auth.signInWithPassword({
    email: parsedInput.email,
    password: parsedInput.password
  });

  if (signedIn.error || !signedIn.data.session) {
    return NextResponse.json({ error: signedIn.error?.message ?? "invalid_credentials" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("sb-access-token", signedIn.data.session.access_token, {
    ...COOKIE_OPTIONS,
    maxAge: signedIn.data.session.expires_in
  });
  res.cookies.set("sb-refresh-token", signedIn.data.session.refresh_token, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24 * 30
  });
  return res;
}
