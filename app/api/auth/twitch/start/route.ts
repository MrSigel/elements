import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function GET(req: NextRequest) {
  const state = crypto.randomBytes(16).toString("hex");
  const scopes = [
    "user:read:email",
    "channel:read:subscriptions",
    "moderator:read:chat_messages",
    "moderator:manage:chat_messages"
  ].join(" ");
  const url = new URL("https://id.twitch.tv/oauth2/authorize");
  url.searchParams.set("client_id", env.TWITCH_CLIENT_ID);
  url.searchParams.set("redirect_uri", env.TWITCH_REDIRECT_URI);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", scopes);
  url.searchParams.set("state", state);

  const res = NextResponse.redirect(url);
  res.cookies.set("tw_state", state, { httpOnly: true, sameSite: "lax", secure: true, path: "/" });
  return res;
}

