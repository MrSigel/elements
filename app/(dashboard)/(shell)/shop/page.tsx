import { ShopPanel } from "@/components/dashboard/ShopPanel";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ShopPage() {
  const userClient = await createServerClient();
  const { data: auth } = await userClient.auth.getUser();

  let plan: "starter" | "pro" | "enterprise" = "starter";
  let expiresAt: string | null = null;

  if (auth.user) {
    const admin = createServiceClient();
    const { data: channel } = await admin
      .from("channels")
      .select("subscription_plan, subscription_expires_at")
      .eq("owner_id", auth.user.id)
      .limit(1)
      .maybeSingle();
    const rawPlan = (channel as { subscription_plan?: string } | null)?.subscription_plan ?? "starter";
    if (rawPlan === "pro" || rawPlan === "enterprise" || rawPlan === "starter") {
      plan = rawPlan;
    }
    expiresAt = (channel as { subscription_expires_at?: string } | null)?.subscription_expires_at ?? null;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text">Shop</h1>
          <p className="text-sm text-subtle mt-1">Buy or upgrade your subscription package directly from your dashboard.</p>
        </div>
        <div className="rounded-lg border border-panelMuted bg-panel px-3 py-2 text-right">
          <p className="text-[10px] uppercase tracking-[0.15em] text-subtle/70">Current Plan</p>
          <p className="text-sm font-bold text-text">{plan}</p>
          {expiresAt && plan !== "starter" ? (
            <p className="text-[10px] text-subtle mt-1">Active until {new Date(expiresAt).toLocaleDateString()}</p>
          ) : null}
        </div>
      </div>

      <section className="rounded-xl border border-panelMuted bg-panel p-5 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-text">Choose your package</h2>
          <p className="text-xs text-subtle mt-0.5">
            Uses the same secure crypto checkout from the landing page. Supported: BTC, ETH, USDT (TRC20), LTC.
          </p>
        </div>
        <ShopPanel currentPlan={plan} />
      </section>
    </div>
  );
}
