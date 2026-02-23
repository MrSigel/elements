"use client";

import { useState } from "react";
import { CheckoutModal } from "@/components/CheckoutModal";

type Plan = "starter" | "pro" | "enterprise";

export function ShopPanel({ currentPlan }: { currentPlan: Plan }) {
  const [checkout, setCheckout] = useState<{ plan: "pro" | "enterprise" } | null>(null);

  return (
    <>
      <div className="grid gap-5 md:grid-cols-3">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex flex-col">
          <p className="text-xs font-bold uppercase tracking-widest text-subtle mb-1">Starter</p>
          <p className="text-4xl font-black mb-1">Free</p>
          <p className="text-sm text-subtle mb-5">Get started, no card required</p>
          <ul className="space-y-2.5 text-sm text-subtle mb-6 flex-1">
            {["1 channel", "Core overlays & viewer tools", "Twitch bot commands", "Basic moderation access"].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="text-accent">+</span> {item}
              </li>
            ))}
          </ul>
          <button
            type="button"
            disabled
            className="w-full rounded-xl border border-panelMuted py-2.5 text-sm font-semibold text-subtle cursor-default"
          >
            {currentPlan === "starter" ? "Current Plan" : "Downgrade via Support"}
          </button>
        </section>

        <section
          className="rounded-2xl border border-accent/40 p-6 relative overflow-hidden flex flex-col"
          style={{ background: "linear-gradient(145deg, rgba(245,196,81,0.08) 0%, rgba(178,34,52,0.08) 100%)" }}
        >
          <div className="absolute top-3 right-3 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-black" style={{ background: "linear-gradient(135deg, #f5c451, #e8a020)" }}>
            Popular
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-accent mb-1">Pro</p>
          <p className="text-4xl font-black mb-1">
            150 EUR<span className="text-lg text-subtle font-normal">/mo</span>
          </p>
          <p className="text-sm text-subtle mb-5">For growing teams</p>
          <ul className="space-y-2.5 text-sm text-subtle mb-6 flex-1">
            {["Up to 3 channels", "Limited overlays & front pages", "Priority bot restart", "Standard support"].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="text-accent">+</span> {item}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setCheckout({ plan: "pro" })}
            disabled={currentPlan === "pro"}
            className="w-full rounded-xl py-2.5 text-sm font-black text-black transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #f5c451, #e8a020)" }}
          >
            {currentPlan === "pro" ? "Current Plan" : "Buy / Upgrade to Pro"}
          </button>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex flex-col">
          <p className="text-xs font-bold uppercase tracking-widest text-subtle mb-1">Enterprise</p>
          <p className="text-4xl font-black mb-1">
            300 EUR<span className="text-lg text-subtle font-normal">/mo</span>
          </p>
          <p className="text-sm text-subtle mb-5">Unlimited, no restrictions</p>
          <ul className="space-y-2.5 text-sm text-subtle mb-6 flex-1">
            {["Unlimited channels", "All 14 widget types", "Unlimited overlays & pages", "Prioritized enterprise support"].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="text-accent">+</span> {item}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setCheckout({ plan: "enterprise" })}
            disabled={currentPlan === "enterprise"}
            className="w-full rounded-xl border border-accent/30 py-2.5 text-sm font-semibold text-accent hover:bg-accent/10 transition-colors disabled:opacity-60"
          >
            {currentPlan === "enterprise" ? "Current Plan" : "Buy / Upgrade to Enterprise"}
          </button>
        </section>
      </div>

      {checkout ? <CheckoutModal plan={checkout.plan} onClose={() => setCheckout(null)} /> : null}
    </>
  );
}

