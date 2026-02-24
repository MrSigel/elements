import { NextResponse } from "next/server";
import { activeBots } from "@/lib/twitch/bot";

export async function GET() {
  const channels = Array.from(activeBots.entries()).map(([slug, client]) => ({
    slug,
    connected: client.readyState() === "OPEN",
    readyState: client.readyState()
  }));
  return NextResponse.json({ count: channels.length, channels });
}
