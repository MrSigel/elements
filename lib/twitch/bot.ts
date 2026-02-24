import net from "net";
import { createServiceClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

async function refreshTwitchTokenIfNeeded(userId: string) {
  const admin = createServiceClient();
  const { data: user } = await admin
    .from("users")
    .select("twitch_access_token,twitch_refresh_token,twitch_token_expires_at,twitch_token_scope")
    .eq("id", userId)
    .maybeSingle();

  const accessToken = user?.twitch_access_token?.trim();
  const refreshToken = user?.twitch_refresh_token?.trim();
  const expiresAt = user?.twitch_token_expires_at ? new Date(user.twitch_token_expires_at).getTime() : 0;

  if (accessToken && expiresAt > Date.now() + 60_000) {
    return { accessToken, refreshToken: refreshToken ?? null };
  }
  if (!refreshToken) return { accessToken: accessToken ?? "", refreshToken: null };

  const tokenRes = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.TWITCH_CLIENT_ID,
      client_secret: env.TWITCH_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: refreshToken
    })
  });

  if (!tokenRes.ok) return { accessToken: accessToken ?? "", refreshToken };
  const refreshed = (await tokenRes.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    scope?: string[];
  };
  if (!refreshed.access_token) return { accessToken: accessToken ?? "", refreshToken };

  const newExpiresAt = refreshed.expires_in ? new Date(Date.now() + refreshed.expires_in * 1000).toISOString() : null;
  await admin.from("users").update({
    twitch_access_token: refreshed.access_token,
    twitch_refresh_token: refreshed.refresh_token ?? refreshToken,
    twitch_token_expires_at: newExpiresAt,
    twitch_token_scope: refreshed.scope ?? user?.twitch_token_scope ?? null
  }).eq("id", userId);

  return { accessToken: refreshed.access_token, refreshToken: refreshed.refresh_token ?? refreshToken };
}

// Module-level singleton: channelLogin → cleanup function
const activeBots = new Map<string, () => void>();

type HotWord = { id: string; phrase: string; cooldown_seconds: number; per_user_limit: number };

/** General-purpose channel bot: handles all chat commands + hotword detection. */
async function startChannelBot(channelLogin: string): Promise<() => void> {
  const admin = createServiceClient();

  const { data: channel } = await admin
    .from("channels")
    .select("id,owner_id")
    .eq("slug", channelLogin)
    .maybeSingle();
  if (!channel?.id || !channel?.owner_id) return () => undefined;
  const channelId = channel.id as string;

  const { data: owner } = await admin
    .from("users")
    .select("twitch_login")
    .eq("id", channel.owner_id)
    .maybeSingle();
  const login = (owner?.twitch_login as string | undefined)?.trim();
  const { accessToken } = await refreshTwitchTokenIfNeeded(channel.owner_id as string);
  if (!login || !accessToken) return () => undefined;

  const socket = net.createConnection(6667, "irc.chat.twitch.tv");

  socket.write(`PASS oauth:${accessToken}\r\n`);
  socket.write(`NICK ${login}\r\n`);
  socket.write(`JOIN #${channelLogin}\r\n`);

  // Hotword cache (refreshed every 30s to pick up new hotwords without restarting)
  let cachedHotWords: HotWord[] | null = null;
  let hwCacheTime = 0;

  function say(msg: string) {
    socket.write(`PRIVMSG #${channelLogin} :${msg}\r\n`);
  }

  async function getWidgetInfo(widgetType: string): Promise<{ id: string; overlay_id: string } | null> {
    const { data: overlays } = await admin
      .from("overlays")
      .select("id")
      .eq("channel_id", channelId);
    if (!overlays?.length) return null;
    const { data: wi } = await admin
      .from("widget_instances")
      .select("id,overlay_id")
      .eq("kind", widgetType)
      .in("overlay_id", (overlays as { id: string }[]).map(o => o.id))
      .limit(1)
      .maybeSingle();
    return (wi as { id: string; overlay_id: string } | null) ?? null;
  }

  async function refreshSnapshot(
    widgetType: string,
    eventType: string,
    payload: Record<string, unknown>,
    overlayId: string,
    widgetInstanceId?: string
  ) {
    await admin.rpc("apply_widget_event", {
      p_channel_id: channelId,
      p_overlay_id: overlayId,
      p_widget_instance_id: widgetInstanceId ?? null,
      p_widget_type: widgetType,
      p_event_type: eventType,
      p_payload: payload,
      p_actor_id: null
    });
  }

  async function getUserPoints(username: string): Promise<number> {
    const { data } = await admin
      .from("points_ledger")
      .select("points_delta")
      .eq("channel_id", channelId)
      .eq("twitch_user_id", username);
    return ((data ?? []) as { points_delta: number }[]).reduce((sum, r) => sum + r.points_delta, 0);
  }

  socket.on("data", async (chunk) => {
    const text = chunk.toString("utf8");

    if (text.includes("PING :tmi.twitch.tv")) {
      socket.write("PONG :tmi.twitch.tv\r\n");
      return;
    }

    const msgMatch = text.match(/:(.+)!.+ PRIVMSG #.+ :(.+)/);
    if (!msgMatch) return;
    const username = msgMatch[1].toLowerCase();
    const message = msgMatch[2].trim();

    // ── !guess [number] — bonushunt quick guessing ──────────────────────────
    const guessMatch = message.match(/^!guess\s+([0-9]+(\.[0-9]+)?)/i);
    if (guessMatch) {
      const { data: snap } = await admin
        .from("widget_snapshots")
        .select("state")
        .eq("channel_id", channelId)
        .eq("widget_type", "quick_guessing")
        .maybeSingle();
      const state = snap?.state as { open?: boolean } | null;
      if (!state?.open) return;

      const { data: hunt } = await admin
        .from("bonushunts")
        .select("id")
        .eq("channel_id", channelId)
        .eq("status", "active")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!hunt) return;

      await admin.from("guesses").upsert(
        { bonushunt_id: hunt.id, twitch_user_id: username, value: Number(guessMatch[1]) },
        { onConflict: "bonushunt_id,twitch_user_id" }
      );
      return;
    }

    // ── !slotrequest [slot name] ─────────────────────────────────────────────
    const srMatch = message.match(/^!slotrequest\s+(.+)/i);
    if (srMatch) {
      const slotName = srMatch[1].trim().slice(0, 100);

      const { data: banned } = await admin
        .from("viewer_blacklist")
        .select("id")
        .eq("channel_id", channelId)
        .eq("viewer_id", username)
        .maybeSingle();
      if (banned) return;

      const now = new Date();
      const { data: cooldown } = await admin
        .from("viewer_cooldowns")
        .select("cooldown_until")
        .eq("channel_id", channelId)
        .eq("viewer_id", username)
        .eq("action", "slot_request_submit")
        .maybeSingle();
      if (cooldown && new Date((cooldown as { cooldown_until: string }).cooldown_until).getTime() > now.getTime()) {
        say(`@${username} you are still on cooldown for slot requests.`);
        return;
      }

      const windowStart = new Date(now.getTime() - 60_000).toISOString();
      const { count } = await admin
        .from("rate_limits")
        .select("id", { count: "exact", head: true })
        .eq("scope", "viewer")
        .eq("scope_id", username)
        .eq("action", `request:${channelId}`)
        .gte("window_start", windowStart);
      if ((count ?? 0) >= 3) {
        say(`@${username} you have reached the rate limit for slot requests.`);
        return;
      }

      await admin.from("rate_limits").insert({
        scope: "viewer",
        scope_id: username,
        action: `request:${channelId}`,
        window_start: now.toISOString(),
        hit_count: 1
      });

      const { error } = await admin
        .from("slot_requests")
        .upsert(
          { channel_id: channelId, twitch_user_id: username, slot_name: slotName, status: "open" },
          { onConflict: "channel_id,twitch_user_id,slot_name" }
        );
      if (error) return;

      const cooldownUntil = new Date(now.getTime() + 30_000).toISOString();
      await admin.from("viewer_cooldowns").upsert(
        { channel_id: channelId, viewer_id: username, action: "slot_request_submit", cooldown_until: cooldownUntil },
        { onConflict: "channel_id,viewer_id,action" }
      );

      const wi = await getWidgetInfo("slot_requests");
      if (wi) await refreshSnapshot("slot_requests", "request_add", { twitch_user_id: username, slot_name: slotName }, wi.overlay_id, wi.id);

      say(`@${username} your slot request "${slotName}" has been added!`);
      return;
    }

    // ── !join [team] — points battle ─────────────────────────────────────────
    const joinMatch = message.match(/^!join\s+(\S+)/i);
    if (joinMatch) {
      const teamArg = joinMatch[1].trim();

      const { data: pb } = await admin
        .from("points_battles")
        .select("id,overlay_id,team_a,team_b,entry_cost")
        .eq("channel_id", channelId)
        .eq("status", "running")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!pb) {
        say(`@${username} there is no active battle right now.`);
        return;
      }

      const pbData = pb as { id: string; overlay_id: string; team_a: string; team_b: string; entry_cost: number };
      const normalizedTeam = [pbData.team_a, pbData.team_b].find(
        t => t.toLowerCase() === teamArg.toLowerCase()
      );
      if (!normalizedTeam) {
        say(`@${username} invalid team. Use "${pbData.team_a}" or "${pbData.team_b}".`);
        return;
      }

      const points = await getUserPoints(username);
      if (points < pbData.entry_cost) {
        say(`@${username} you need ${pbData.entry_cost} points to join (you have ${points}).`);
        return;
      }

      await admin.from("points_ledger").insert({
        channel_id: channelId,
        twitch_user_id: username,
        points_delta: -pbData.entry_cost,
        reason: "points_battle_join",
        metadata: { points_battle_id: pbData.id }
      });

      await admin.from("points_battle_entries").upsert(
        { points_battle_id: pbData.id, twitch_user_id: username, team: normalizedTeam, points: pbData.entry_cost },
        { onConflict: "points_battle_id,twitch_user_id" }
      );

      const pbWi = await getWidgetInfo("points_battle");
      await refreshSnapshot(
        "points_battle",
        "points_battle_join",
        { twitch_user_id: username, team: normalizedTeam, points: pbData.entry_cost },
        pbData.overlay_id,
        pbWi?.id
      );

      say(`@${username} you joined team ${normalizedTeam}!`);
      return;
    }

    // ── !points — check loyalty balance ──────────────────────────────────────
    if (/^!points$/i.test(message)) {
      const points = await getUserPoints(username);
      say(`@${username} you have ${points} points.`);
      return;
    }

    // ── !redeem [item name] — redeem a loyalty store item ────────────────────
    const redeemMatch = message.match(/^!redeem\s+(.+)/i);
    if (redeemMatch) {
      const itemName = redeemMatch[1].trim();

      const { data: items } = await admin
        .from("store_items")
        .select("id,name,cost,cooldown_seconds")
        .eq("channel_id", channelId)
        .eq("is_active", true);
      const allItems = (items ?? []) as { id: string; name: string; cost: number; cooldown_seconds: number }[];
      const item = allItems.find(i => i.name.toLowerCase() === itemName.toLowerCase());
      if (!item) {
        say(`@${username} item "${itemName}" not found in the store.`);
        return;
      }

      const points = await getUserPoints(username);
      if (points < item.cost) {
        say(`@${username} you need ${item.cost} points to redeem "${item.name}" (you have ${points}).`);
        return;
      }

      if (item.cooldown_seconds > 0) {
        const { data: lastRedeem } = await admin
          .from("redemptions")
          .select("created_at")
          .eq("channel_id", channelId)
          .eq("store_item_id", item.id)
          .eq("twitch_user_id", username)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (lastRedeem) {
          const elapsed = (Date.now() - new Date((lastRedeem as { created_at: string }).created_at).getTime()) / 1000;
          if (elapsed < item.cooldown_seconds) {
            say(`@${username} this item is on cooldown (${Math.ceil(item.cooldown_seconds - elapsed)}s remaining).`);
            return;
          }
        }
      }

      await admin.from("redemptions").insert({
        channel_id: channelId,
        store_item_id: item.id,
        twitch_user_id: username,
        status: "pending"
      });

      await admin.from("points_ledger").insert({
        channel_id: channelId,
        twitch_user_id: username,
        points_delta: -item.cost,
        reason: "store_redeem",
        metadata: { store_item_id: item.id, item_name: item.name }
      });

      const wi = await getWidgetInfo("loyalty");
      if (wi) await refreshSnapshot("loyalty", "store_redeem", { twitch_user_id: username, name: item.name }, wi.overlay_id, wi.id);

      say(`@${username} you redeemed "${item.name}"!`);
      return;
    }

    // ── Hotword scanning — check every message against configured phrases ─────
    const nowMs = Date.now();
    if (!cachedHotWords || nowMs - hwCacheTime > 30_000) {
      const { data: hw } = await admin
        .from("hot_words")
        .select("id,phrase,cooldown_seconds,per_user_limit")
        .eq("channel_id", channelId);
      cachedHotWords = (hw ?? []) as HotWord[];
      hwCacheTime = nowMs;
    }

    for (const hw of cachedHotWords) {
      if (!message.toLowerCase().includes(hw.phrase.toLowerCase())) continue;

      // Per-user limit check
      if (hw.per_user_limit > 0) {
        const { count: userCount } = await admin
          .from("hot_word_occurrences")
          .select("id", { count: "exact", head: true })
          .eq("hot_word_id", hw.id)
          .eq("twitch_user_id", username);
        if ((userCount ?? 0) >= hw.per_user_limit) continue;
      }

      // Global cooldown check
      if (hw.cooldown_seconds > 0) {
        const since = new Date(nowMs - hw.cooldown_seconds * 1000).toISOString();
        const { count: recentCount } = await admin
          .from("hot_word_occurrences")
          .select("id", { count: "exact", head: true })
          .eq("hot_word_id", hw.id)
          .gte("created_at", since);
        if ((recentCount ?? 0) > 0) continue;
      }

      await admin.from("hot_word_occurrences").insert({ hot_word_id: hw.id, twitch_user_id: username });

      const hwWi = await getWidgetInfo("hot_words");
      if (hwWi) await refreshSnapshot("hot_words", "hot_word_hit", { phrase: hw.phrase, twitch_user_id: username }, hwWi.overlay_id, hwWi.id);

      break; // Only trigger one hotword per message
    }
  });

  return () => socket.end();
}

/** Start the channel bot if not already running. Updates DB flag for persistence. */
export async function ensureBotStarted(channelLogin: string): Promise<void> {
  if (activeBots.has(channelLogin)) return;
  const cleanup = await startChannelBot(channelLogin);
  activeBots.set(channelLogin, cleanup);
  // Mark bot as active in DB so it can be restarted on cold start
  void createServiceClient().from("channels").update({ bot_active: true }).eq("slug", channelLogin);
}

/** Stop the channel bot for a channel. Updates DB flag. */
export function stopBot(channelLogin: string): void {
  const cleanup = activeBots.get(channelLogin);
  if (cleanup) {
    cleanup();
    activeBots.delete(channelLogin);
    void createServiceClient().from("channels").update({ bot_active: false }).eq("slug", channelLogin);
  }
}
