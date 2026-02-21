import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { createServiceClient } from "@/lib/supabase/server";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2).max(64).optional()
});

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/"
};

function makeHandle(base: string, suffix: string) {
  const normalized = base
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);

  const safeBase = normalized || "creator";
  return `${safeBase}-${suffix}`;
}

export async function POST(req: NextRequest) {
  let parsedInput: z.infer<typeof registerSchema>;
  try {
    parsedInput = registerSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid_register_payload" }, { status: 400 });
  }

  const admin = createServiceClient();
  const { email, password } = parsedInput;
  const baseName = parsedInput.displayName?.trim() || email.split("@")[0] || "Creator";

  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: baseName, provider: "email" }
  });

  if (created.error || !created.data.user?.id) {
    const status = created.error?.message?.toLowerCase().includes("already") ? 409 : 400;
    return NextResponse.json({ error: created.error?.message ?? "register_failed" }, { status });
  }

  const uid = created.data.user.id;
  const suffix = uid.replace(/-/g, "").slice(0, 8);
  const handle = makeHandle(baseName, suffix);

  try {
    const { error: userError } = await admin.from("users").upsert(
      {
        id: uid,
        twitch_user_id: uid,
        twitch_login: handle,
        twitch_display_name: baseName
      },
      { onConflict: "id" }
    );
    if (userError) throw userError;

    const { data: channel, error: channelError } = await admin
      .from("channels")
      .upsert(
        {
          owner_id: uid,
          twitch_channel_id: uid,
          slug: handle,
          title: `${baseName}'s Channel`
        },
        { onConflict: "twitch_channel_id" }
      )
      .select("id")
      .single();
    if (channelError || !channel?.id) throw channelError ?? new Error("channel_create_failed");

    const { error: roleError } = await admin
      .from("channel_roles")
      .upsert({ channel_id: channel.id, user_id: uid, role: "owner" }, { onConflict: "channel_id,user_id" });
    if (roleError) throw roleError;
  } catch (error) {
    await admin.auth.admin.deleteUser(uid);
    return NextResponse.json({ error: error instanceof Error ? error.message : "profile_bootstrap_failed" }, { status: 500 });
  }

  const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const signedIn = await client.auth.signInWithPassword({ email, password });
  if (signedIn.error || !signedIn.data.session) {
    return NextResponse.json({ error: signedIn.error?.message ?? "session_create_failed" }, { status: 401 });
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
