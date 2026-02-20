import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { createServiceClient } from "@/lib/supabase/server";

type TwitchToken = { access_token: string };
type TwitchUser = { id: string; login: string; display_name: string; profile_image_url: string };

async function resolveOrCreateAuthUser(admin: ReturnType<typeof createServiceClient>, email: string, twitch: TwitchUser) {
  const existing = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const found = existing.data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (found) return found.id;

  const created = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { provider: "twitch", twitch_id: twitch.id, twitch_login: twitch.login }
  });

  if (created.error || !created.data.user?.id) {
    throw new Error(created.error?.message ?? "user_create_failed");
  }

  return created.data.user.id;
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const expected = cookies().get("tw_state")?.value;
  if (!code || !state || state !== expected) return NextResponse.json({ error: "invalid_oauth_state" }, { status: 400 });

  const tokenRes = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.TWITCH_CLIENT_ID,
      client_secret: env.TWITCH_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: env.TWITCH_REDIRECT_URI
    })
  });
  if (!tokenRes.ok) return NextResponse.json({ error: "token_exchange_failed" }, { status: 400 });

  const token = (await tokenRes.json()) as TwitchToken;
  const meRes = await fetch("https://api.twitch.tv/helix/users", {
    headers: { Authorization: `Bearer ${token.access_token}`, "Client-Id": env.TWITCH_CLIENT_ID }
  });
  const me = ((await meRes.json()) as { data: TwitchUser[] }).data?.[0];
  if (!me) return NextResponse.json({ error: "twitch_user_fetch_failed" }, { status: 400 });

  const admin = createServiceClient();
  const email = `${me.id}@twitch.local`;

  try {
    const uid = await resolveOrCreateAuthUser(admin, email, me);

    await admin.from("users").upsert({
      id: uid,
      twitch_user_id: me.id,
      twitch_login: me.login,
      twitch_display_name: me.display_name,
      avatar_url: me.profile_image_url
    }, { onConflict: "id" });

    const { data: channel } = await admin.from("channels").upsert({
      owner_id: uid,
      twitch_channel_id: me.id,
      slug: me.login,
      title: `${me.display_name}'s Channel`
    }, { onConflict: "twitch_channel_id" }).select("id").single();

    if (channel?.id) {
      await admin.from("channel_roles").upsert({ channel_id: channel.id, user_id: uid, role: "owner" }, { onConflict: "channel_id,user_id" });
    }

    const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo: `${env.NEXT_PUBLIC_APP_URL}/onboarding` }
    });

    if (linkErr) return NextResponse.json({ error: linkErr.message }, { status: 500 });
    return NextResponse.redirect(link.properties.action_link);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "oauth_failed" }, { status: 500 });
  }
}

