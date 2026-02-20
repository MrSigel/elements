import { z } from "zod";

const uuid = z.string().uuid();

const base = z.object({
  overlayId: uuid,
  widgetInstanceId: uuid.optional()
});

export const widgetActionInputSchema = z.discriminatedUnion("widgetType", [
  z.object({
    ...base.shape,
    widgetType: z.literal("wager_bar"),
    eventType: z.literal("set_wager"),
    payload: z.object({ value: z.number() })
  }),
  z.object({
    ...base.shape,
    widgetType: z.literal("deposit_withdrawal"),
    eventType: z.literal("add_transaction"),
    payload: z.object({ tx_type: z.enum(["deposit", "withdrawal"]), amount: z.number(), source: z.string().default("manual") })
  }),
  z.object({
    ...base.shape,
    widgetType: z.literal("current_playing"),
    eventType: z.literal("set_current_playing"),
    payload: z.object({ game_name: z.string(), game_identifier: z.string(), provider: z.string() })
  }),
  z.object({
    ...base.shape,
    widgetType: z.literal("bonushunt"),
    eventType: z.literal("bonushunt_add_bonus"),
    payload: z.object({ slot_name: z.string(), provider: z.string().optional(), bet: z.number(), cost: z.number() })
  }),
  z.object({
    ...base.shape,
    widgetType: z.literal("quick_guessing"),
    eventType: z.enum(["guessing_open", "guessing_close"]),
    payload: z.record(z.any())
  }),
  z.object({
    ...base.shape,
    widgetType: z.literal("tournament"),
    eventType: z.literal("score_update"),
    payload: z.object({ participant: z.string(), score: z.number() })
  }),
  z.object({
    ...base.shape,
    widgetType: z.literal("wheel"),
    eventType: z.literal("wheel_spin"),
    payload: z.object({ seed: z.string(), segments: z.array(z.string()).min(2) })
  }),
  z.object({
    ...base.shape,
    widgetType: z.literal("slot_battle"),
    eventType: z.enum(["battle_start", "battle_round", "battle_end"]),
    payload: z.record(z.any())
  }),
  z.object({
    ...base.shape,
    widgetType: z.literal("slot_requests"),
    eventType: z.enum(["request_add", "raffle_draw"]),
    payload: z.record(z.any())
  }),
  z.object({
    ...base.shape,
    widgetType: z.literal("hot_words"),
    eventType: z.enum(["hot_word_add", "hot_word_hit"]),
    payload: z.record(z.any())
  }),
  z.object({
    ...base.shape,
    widgetType: z.literal("loyalty"),
    eventType: z.enum(["points_grant", "store_item_create", "store_redeem"]),
    payload: z.record(z.any())
  }),
  z.object({
    ...base.shape,
    widgetType: z.literal("points_battle"),
    eventType: z.enum(["points_battle_start", "points_battle_join", "points_battle_end"]),
    payload: z.record(z.any())
  }),
  z.object({
    ...base.shape,
    widgetType: z.literal("personal_bests"),
    eventType: z.literal("personal_best_set"),
    payload: z.object({ metric_key: z.string(), metric_value: z.number() })
  })
]);

export type WidgetActionInput = z.infer<typeof widgetActionInputSchema>;

