import { describe, expect, it } from "vitest";
import { widgetActionInputSchema } from "@/lib/schemas/widgetActions";

describe("widget action schema", () => {
  it("rejects wrong payload for widget", () => {
    const parsed = widgetActionInputSchema.safeParse({
      overlayId: "3f0ff44a-7f34-482f-8b50-96cf0fd64e2e",
      widgetType: "wager_bar",
      eventType: "set_wager",
      payload: { tx_type: "deposit", amount: 100 }
    });
    expect(parsed.success).toBe(false);
  });

  it("accepts valid wager payload", () => {
    const parsed = widgetActionInputSchema.safeParse({
      overlayId: "3f0ff44a-7f34-482f-8b50-96cf0fd64e2e",
      widgetType: "wager_bar",
      eventType: "set_wager",
      payload: { value: 120 }
    });
    expect(parsed.success).toBe(true);
  });

  it("accepts valid wheel payload", () => {
    const parsed = widgetActionInputSchema.safeParse({
      overlayId: "3f0ff44a-7f34-482f-8b50-96cf0fd64e2e",
      widgetType: "wheel",
      eventType: "wheel_spin",
      payload: { seed: "abc", segments: ["A", "B"] }
    });
    expect(parsed.success).toBe(true);
  });
});

