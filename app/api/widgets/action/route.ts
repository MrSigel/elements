import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { widgetActionInputSchema } from "@/lib/schemas/widgetActions";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import { AuthzError, getOverlayChannelId, requireChannelPermission } from "@/lib/authz";

async function latestOrCreateBattle(admin: ReturnType<typeof createServiceClient>, channelId: string, overlayId: string) {
  const { data: latest } = await admin.from("slot_battles").select("id").eq("channel_id", channelId).eq("overlay_id", overlayId).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (latest) return latest.id;
  const { data: created } = await admin.from("slot_battles").insert({ channel_id: channelId, overlay_id: overlayId, slot_a: "A", slot_b: "B" }).select("id").single();
  return created?.id;
}

async function latestOrCreatePointsBattle(admin: ReturnType<typeof createServiceClient>, channelId: string, overlayId: string) {
  const { data: latest } = await admin.from("points_battles").select("id").eq("channel_id", channelId).eq("overlay_id", overlayId).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (latest) return latest.id;
  const { data: created } = await admin.from("points_battles").insert({ channel_id: channelId, overlay_id: overlayId, team_a: "A", team_b: "B", entry_cost: 10 }).select("id").single();
  return created?.id;
}

async function applyWidgetSideEffects(admin: ReturnType<typeof createServiceClient>, input: { channelId: string; overlayId: string; widgetType: string; eventType: string; payload: Record<string, unknown>; actorId: string; }) {
  if (input.widgetType === "wager_bar" && input.eventType === "set_wager") {
    await admin.from("wagers").upsert({ channel_id: input.channelId, overlay_id: input.overlayId, value: Number(input.payload.value ?? 0), updated_at: new Date().toISOString() }, { onConflict: "overlay_id" });
  }

  if (input.widgetType === "deposit_withdrawal" && input.eventType === "add_transaction") {
    await admin.from("transactions").insert({ channel_id: input.channelId, tx_type: String(input.payload.tx_type ?? "deposit"), amount: Number(input.payload.amount ?? 0), source: String(input.payload.source ?? "manual") });
  }

  if (input.widgetType === "current_playing" && input.eventType === "set_current_playing") {
    await admin.from("current_playing").upsert({ channel_id: input.channelId, game_identifier: String(input.payload.game_identifier ?? input.payload.game ?? "unknown"), game_name: String(input.payload.game_name ?? input.payload.game ?? "Unknown"), provider: String(input.payload.provider ?? "Unknown"), updated_at: new Date().toISOString() }, { onConflict: "channel_id" });
  }

  if (input.widgetType === "bonushunt" && input.eventType === "bonushunt_add_bonus") {
    const { data: hunt } = await admin.from("bonushunts").upsert({ channel_id: input.channelId, overlay_id: input.overlayId, title: "Main Bonushunt", status: "active" }, { onConflict: "channel_id,overlay_id" }).select("id").single();
    if (hunt) await admin.from("bonushunt_entries").insert({ bonushunt_id: hunt.id, slot_name: String(input.payload.slot_name ?? "Unknown"), provider: String(input.payload.provider ?? ""), bet: Number(input.payload.bet ?? 0), cost: Number(input.payload.cost ?? 0) });
  }

  if (input.widgetType === "tournament" && input.eventType === "score_update") {
    const { data: t } = await admin.from("tournaments").upsert({ channel_id: input.channelId, overlay_id: input.overlayId, name: "Main Tournament" }, { onConflict: "channel_id,overlay_id,name" }).select("id").single();
    if (t) await admin.from("tournament_scores").upsert({ tournament_id: t.id, participant: String(input.payload.participant ?? "unknown"), score: Number(input.payload.score ?? 0), updated_at: new Date().toISOString() }, { onConflict: "tournament_id,participant" });
  }

  if (input.widgetType === "wheel" && input.eventType === "wheel_spin") {
    const segments = Array.isArray(input.payload.segments) ? input.payload.segments : ["A", "B", "C"];
    const { data: wheel } = await admin.from("wheels").upsert({ channel_id: input.channelId, overlay_id: input.overlayId, title: "Main Wheel", segments }, { onConflict: "channel_id,overlay_id,title" }).select("id").single();
    if (wheel) {
      const idx = Math.floor(Math.random() * segments.length);
      await admin.from("wheel_spins").insert({ wheel_id: wheel.id, actor_id: input.actorId, seed: String(input.payload.seed ?? crypto.randomUUID()), result: { index: idx, value: segments[idx] } });
    }
  }

  if (input.widgetType === "slot_battle") {
    const battleId = await latestOrCreateBattle(admin, input.channelId, input.overlayId);
    if (battleId) {
      if (input.eventType === "battle_start") {
        await admin.from("slot_battles").update({ slot_a: String(input.payload.slotA ?? "A"), slot_b: String(input.payload.slotB ?? "B"), status: "running", round: 1, score_a: 0, score_b: 0 }).eq("id", battleId);
      }
      if (input.eventType === "battle_round") {
        await admin.from("slot_battles").update({ round: Number(input.payload.round ?? 1), score_a: Number(input.payload.scoreA ?? 0), score_b: Number(input.payload.scoreB ?? 0) }).eq("id", battleId);
      }
      if (input.eventType === "battle_end") {
        await admin.from("slot_battles").update({ status: "finished" }).eq("id", battleId);
      }
    }
  }

  if (input.widgetType === "slot_requests") {
    if (input.eventType === "request_add") {
      await admin.from("slot_requests").insert({ channel_id: input.channelId, twitch_user_id: String(input.payload.twitch_user_id ?? "anon"), slot_name: String(input.payload.slot_name ?? "Unknown") });
    }
    if (input.eventType === "raffle_draw") {
      const { data: open } = await admin.from("slot_requests").select("id").eq("channel_id", input.channelId).eq("status", "open");
      if (open && open.length > 0) {
        const winner = open[Math.floor(Math.random() * open.length)];
        await admin.from("raffles").insert({ channel_id: input.channelId, title: "Main Request Raffle", status: "closed", winner_request_id: winner.id });
        await admin.from("slot_requests").update({ status: "won" }).eq("id", winner.id);
      }
    }
  }

  if (input.widgetType === "hot_words") {
    if (input.eventType === "hot_word_add") {
      await admin.from("hot_words").insert({ channel_id: input.channelId, phrase: String(input.payload.phrase ?? ""), cooldown_seconds: Number(input.payload.cooldown_seconds ?? 10), per_user_limit: Number(input.payload.per_user_limit ?? 1) });
    }
    if (input.eventType === "hot_word_hit") {
      const phrase = String(input.payload.phrase ?? "");
      const { data: hw } = await admin.from("hot_words").select("id").eq("channel_id", input.channelId).eq("phrase", phrase).order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (hw) await admin.from("hot_word_occurrences").insert({ hot_word_id: hw.id, twitch_user_id: String(input.payload.twitch_user_id ?? "anon") });
    }
  }

  if (input.widgetType === "personal_bests" && input.eventType === "personal_best_set") {
    await admin.from("personal_bests").upsert({ channel_id: input.channelId, metric_key: String(input.payload.metric_key ?? "metric"), metric_value: Number(input.payload.metric_value ?? 0), metadata: input.payload.metadata ?? {}, updated_at: new Date().toISOString() }, { onConflict: "channel_id,metric_key" });
  }

  if (input.widgetType === "loyalty") {
    if (input.eventType === "points_grant") {
      await admin.from("points_ledger").insert({ channel_id: input.channelId, twitch_user_id: String(input.payload.twitch_user_id ?? "anon"), points_delta: Number(input.payload.points ?? 0), reason: String(input.payload.reason ?? "manual_grant"), metadata: input.payload.metadata ?? {} });
    }
    if (input.eventType === "store_item_create") {
      await admin.from("store_items").insert({ channel_id: input.channelId, name: String(input.payload.name ?? "Item"), cost: Number(input.payload.cost ?? 100), cooldown_seconds: Number(input.payload.cooldown_seconds ?? 0), is_active: true });
    }
    if (input.eventType === "store_redeem") {
      const { data: item } = await admin.from("store_items").select("id").eq("channel_id", input.channelId).eq("name", String(input.payload.name ?? "")).maybeSingle();
      if (item) await admin.from("redemptions").insert({ channel_id: input.channelId, store_item_id: item.id, twitch_user_id: String(input.payload.twitch_user_id ?? "anon") });
    }
  }

  if (input.widgetType === "points_battle") {
    const pbId = await latestOrCreatePointsBattle(admin, input.channelId, input.overlayId);
    if (pbId) {
      if (input.eventType === "points_battle_start") {
        await admin.from("points_battles").update({ team_a: String(input.payload.team_a ?? "A"), team_b: String(input.payload.team_b ?? "B"), entry_cost: Number(input.payload.entry_cost ?? 10), status: "running", ends_at: new Date(Date.now() + Number(input.payload.duration_seconds ?? 300) * 1000).toISOString() }).eq("id", pbId);
      }
      if (input.eventType === "points_battle_join") {
        await admin.from("points_battle_entries").upsert({ points_battle_id: pbId, twitch_user_id: String(input.payload.twitch_user_id ?? "anon"), team: String(input.payload.team ?? "A"), points: Number(input.payload.points ?? 0) }, { onConflict: "points_battle_id,twitch_user_id" });
      }
      if (input.eventType === "points_battle_end") {
        await admin.from("points_battles").update({ status: "finished" }).eq("id", pbId);
      }
    }
  }
}

export async function POST(req: NextRequest) {
  const parsed = widgetActionInputSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const userClient = createServerClient();
  const { data: auth } = await userClient.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const admin = createServiceClient();

  try {
    const channelId = await getOverlayChannelId(parsed.data.overlayId);
    await requireChannelPermission({ userId: auth.user.id, channelId, permissionKey: "widget_action", overlayId: parsed.data.overlayId, widgetInstanceId: parsed.data.widgetInstanceId });

    await applyWidgetSideEffects(admin, { channelId, overlayId: parsed.data.overlayId, widgetType: parsed.data.widgetType, eventType: parsed.data.eventType, payload: parsed.data.payload, actorId: auth.user.id });

    const { data, error } = await admin.rpc("apply_widget_event", {
      p_channel_id: channelId,
      p_overlay_id: parsed.data.overlayId,
      p_widget_instance_id: parsed.data.widgetInstanceId ?? null,
      p_widget_type: parsed.data.widgetType,
      p_event_type: parsed.data.eventType,
      p_payload: parsed.data.payload,
      p_actor_id: auth.user.id
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ eventId: data });
  } catch (error) {
    if (error instanceof AuthzError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: error instanceof Error ? error.message : "action_failed" }, { status: 400 });
  }
}



