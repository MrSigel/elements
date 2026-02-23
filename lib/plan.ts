import { createServiceClient } from "@/lib/supabase/server";

export const FREE_WIDGET_KINDS = ["hot_words", "slot_requests"] as const;

export const PLAN_FEATURES: Record<string, {
  allowedWidgets: readonly string[] | null;
  landingPage: boolean;
}> = {
  starter:    { allowedWidgets: FREE_WIDGET_KINDS, landingPage: false },
  pro:        { allowedWidgets: null,              landingPage: false },
  enterprise: { allowedWidgets: null,              landingPage: true  },
};

export async function getChannelPlan(userId: string): Promise<"starter" | "pro" | "enterprise"> {
  const admin = createServiceClient();
  const { data } = await admin
    .from("channels")
    .select("subscription_plan,subscription_expires_at")
    .eq("owner_id", userId)
    .limit(1)
    .maybeSingle();
  if (!data) return "starter";
  const expired =
    data.subscription_expires_at &&
    new Date(data.subscription_expires_at) < new Date();
  if (expired) return "starter";
  const p = (data.subscription_plan as string) ?? "starter";
  return p === "pro" || p === "enterprise" ? p : "starter";
}
