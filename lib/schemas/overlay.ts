import { z } from "zod";

export const overlayCreateSchema = z.object({
  name: z.string().min(2).max(64),
  width: z.number().int().min(320).max(7680),
  height: z.number().int().min(240).max(4320)
});

export const publishOverlaySchema = z.object({
  overlayId: z.string().uuid(),
  published: z.boolean()
});

export const widgetActionSchema = z.object({
  overlayId: z.string().uuid(),
  widgetInstanceId: z.string().uuid().optional(),
  widgetType: z.string().min(1),
  eventType: z.string().min(1),
  payload: z.record(z.any())
});

export const overlayDuplicateSchema = z.object({
  sourceOverlayId: z.string().uuid(),
  name: z.string().min(2).max(64)
});

export const widgetInstanceCreateSchema = z.object({
  overlayId: z.string().uuid(),
  kind: z.enum(["bonushunt","tournament","slot_battle","deposit_withdrawal","wager_bar","current_playing","slot_requests","hot_words","wheel","personal_bests","quick_guessing","loyalty","points_battle"]),
  name: z.string().min(2).max(64),
  x: z.number().min(0).max(10000).default(0),
  y: z.number().min(0).max(10000).default(0),
  width: z.number().min(50).max(4000).default(300),
  height: z.number().min(50).max(4000).default(180)
});

export const widgetConfigUpsertSchema = z.object({
  widgetInstanceId: z.string().uuid(),
  config: z.record(z.any())
});

export const frontpageCreateSchema = z.object({
  overlayId: z.string().uuid(),
  pageType: z.enum(["bonushunt","tournament","requests"]),
  enabled: z.boolean().default(true)
});

export const modInviteSchema = z.object({
  channelId: z.string().uuid(),
  twitchLogin: z.string().min(2).max(64)
});

export const ingestCurrentPlayingSchema = z.object({
  channelSlug: z.string().min(2),
  gameIdentifier: z.string().min(1),
  gameName: z.string().min(1),
  provider: z.string().min(1)
});

