"use client";

import Link from "next/link";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { BrandIcon } from "@/components/BrandIcon";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { CheckoutModal } from "@/components/CheckoutModal";
import { WidgetDemo } from "@/components/overlay/WidgetDemo";

interface HomePageContentProps {
  isLoggedIn: boolean;
  features: string[];
  workflow: Array<{ id: string; title: string; text: string }>;
}

const WIDGETS = [
  { kind: "bonushunt", label: "Bonus Hunt Tracker" },
  { kind: "slot_battle", label: "Slot vs Slot Battles" },
  { kind: "tournament", label: "Viewer Tournaments" },
  { kind: "quick_guessing", label: "Quick Guessing" },
  { kind: "slot_requests", label: "Slot Requests" },
  { kind: "points_battle", label: "Points Battle" },
  { kind: "current_playing", label: "Now Playing" },
  { kind: "hot_words", label: "Hot Words Scanner" },
];

const MARQUEE_ITEMS = [
  "Bonus Hunts",
  "Live Overlays",
  "Viewer Loyalty",
  "Slot Battles",
  "Quick Guessing",
  "Tournament Mode",
  "Hot Words",
  "Request System",
  "OBS Ready",
  "Realtime Sync",
  "Twitch Bot",
  "Points System",
];

const FAQ_ITEMS = [
  {
    q: "How fast can I go live with an overlay?",
    a: "Most channels are live in under 5 minutes: create overlay, publish, copy browser source URL, paste into OBS.",
  },
  {
    q: "Do I need technical knowledge to set up?",
    a: "No advanced setup is required. The dashboard guides each step and keeps token management simple.",
  },
  {
    q: "Can I control what moderators can do?",
    a: "Yes. Permissions are role-based, so mods only get access to actions you explicitly allow.",
  },
  {
    q: "Does the Twitch bot work automatically?",
    a: "Yes. Once you connect Twitch, the bot listens to your chat and handles !guess, !join, !points, !redeem, and more automatically.",
  },
  {
    q: "Can I try before paying?",
    a: "Yes. Start with the free tier and upgrade when you need more scale and advanced controls.",
  },
];

function Widget3DCard({ kind, label, index }: { kind: string; label: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotX = useTransform(my, [-60, 60], [8, -8]);
  const rotY = useTransform(mx, [-60, 60], [-8, 8]);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set(e.clientX - rect.left - rect.width / 2);
    my.set(e.clientY - rect.top - rect.height / 2);
  }

  function onMouseLeave() {
    mx.set(0);
    my.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ rotateX: rotX, rotateY: rotY, transformPerspective: 700 }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.07, duration: 0.5 }}
      className="group relative overflow-hidden rounded-xl border border-accent/25 bg-bg-deep cursor-pointer shadow-lg"
    >
      <div className="absolute inset-0 z-10 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <div className="absolute inset-0 z-10 rounded-xl ring-0 ring-accent/0 group-hover:ring-1 group-hover:ring-accent/50 transition-all duration-300 pointer-events-none" />
      <div className="h-[280px]">
        <WidgetDemo kind={kind} name={label} />
      </div>
    </motion.div>
  );
}

function HeroStack() {
  const CARDS = [
    { kind: "bonushunt", name: "Bonus Hunt", rot: "-3deg", delay: 0, offset: "0px" },
    { kind: "slot_battle", name: "Slot vs Slot Battles", rot: "2.5deg", delay: 0.5, offset: "22px" },
    { kind: "tournament", name: "Viewer Tournaments", rot: "-5deg", delay: 1, offset: "44px" },
  ];

  return (
    <div className="relative h-[340px] md:h-[440px] w-full" style={{ perspective: "1000px" }}>
      {CARDS.map((card, i) => (
        <motion.div
          key={i}
          className="absolute left-0 right-0 mx-auto max-w-[480px] h-[260px] md:h-[300px] rounded-2xl overflow-hidden border border-accent/30 shadow-2xl"
          style={{
            rotate: card.rot,
            zIndex: CARDS.length - i,
            top: card.offset,
            boxShadow:
              i === 0 ? "0 0 80px rgba(245,196,81,0.15), 0 20px 60px rgba(0,0,0,0.5)" : "0 10px 40px rgba(0,0,0,0.4)",
          }}
          animate={{ y: [0, -14, 0] }}
          transition={{
            repeat: Infinity,
            duration: 4 + i * 0.9,
            delay: card.delay,
            ease: "easeInOut",
          }}
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <WidgetDemo kind={card.kind} name={card.name} />
        </motion.div>
      ))}
    </div>
  );
}

export function HomePageContent({ isLoggedIn, features, workflow }: HomePageContentProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [checkout, setCheckout] = useState<{ plan: "pro" | "enterprise" } | null>(null);
  const dashboardHref = (isLoggedIn ? "/home" : "/auth") as never;
  const searchParams = useSearchParams();

  // Auto-open checkout modal after registration redirect (e.g. /?checkout=pro)
  useEffect(() => {
    if (!isLoggedIn) return;
    const plan = searchParams.get("checkout");
    if (plan === "pro" || plan === "enterprise") {
      setCheckout({ plan });
      // Clean up the URL without triggering a navigation
      const url = new URL(window.location.href);
      url.searchParams.delete("checkout");
      window.history.replaceState({}, "", url.toString());
    }
  }, [isLoggedIn, searchParams]);

  return (
    <>
    <div className="min-h-screen text-text overflow-hidden relative">
      <AnimatedBackground />

      {/* ── NAV ── */}
      <motion.header
        className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-xl bg-black/30"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4 md:px-10">
          <div className="flex items-center gap-2.5">
            <BrandIcon size="md" />
            <span className="text-base font-black tracking-[0.15em] uppercase">Pulseframelabs</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#widgets" className="text-sm text-subtle hover:text-accent transition-colors">
              Widgets
            </a>
            <a href="#features" className="text-sm text-subtle hover:text-accent transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-sm text-subtle hover:text-accent transition-colors">
              Pricing
            </a>
            <Link
              href={dashboardHref}
              className="px-5 py-2 rounded-lg font-black text-black text-sm hover:shadow-lg hover:shadow-accent/40 hover:scale-105 transition-all"
              style={{ background: "linear-gradient(135deg, #f5c451, #e8a020)" }}
            >
              {isLoggedIn ? "Dashboard" : "Get Started"}
            </Link>
          </nav>
          <Link
            href={dashboardHref}
            className="md:hidden px-4 py-1.5 rounded-lg font-bold text-black text-sm"
            style={{ background: "linear-gradient(135deg, #f5c451, #e8a020)" }}
          >
            {isLoggedIn ? "Dashboard" : "Get Started"}
          </Link>
        </div>
      </motion.header>

      <main className="relative z-10">
        {/* ── HERO ── */}
        <section className="mx-auto max-w-7xl px-5 md:px-10 pt-16 pb-8 md:pt-24 md:pb-12 grid md:grid-cols-2 gap-12 md:gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <motion.div
              className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border border-accent/40 bg-accent/10"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-bold text-accent uppercase tracking-widest">Casino Stream Platform</span>
            </motion.div>

            <h1 className="text-5xl md:text-6xl xl:text-7xl font-black leading-[1.05] mb-6">
              Stream Like a{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(135deg, #f5c451 0%, #e8a020 40%, #b22234 100%)" }}
              >
                High Roller
              </span>
            </h1>

            <p className="text-lg text-subtle mb-8 leading-relaxed max-w-lg">
              OBS overlays, Twitch bot, viewer loyalty, slot battles, bonus hunts — all in one platform built for casino
              streamers.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={dashboardHref}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-black text-black text-base shadow-xl hover:shadow-accent/40 hover:scale-105 transition-all duration-300"
                style={{ background: "linear-gradient(135deg, #f5c451, #e8a020)" }}
              >
                {isLoggedIn ? "Open Dashboard" : "Start For Free"}
                <span className="text-lg">→</span>
              </Link>
              <a
                href="#widgets"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-accent border border-accent/30 hover:border-accent/60 hover:bg-accent/5 transition-all duration-300"
              >
                See Widgets
              </a>
            </div>

            {/* Trust badges */}
            <div className="mt-10 flex items-center gap-8">
              {[
                ["10k+", "Streamers"],
                ["99.9%", "Uptime"],
                ["<5min", "Setup"],
              ].map(([val, label]) => (
                <div key={label}>
                  <p className="text-2xl font-black text-accent">{val}</p>
                  <p className="text-xs text-subtle">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          >
            <HeroStack />
          </motion.div>
        </section>

        {/* ── MARQUEE ── */}
        <div className="border-y border-accent/10 bg-black/20 backdrop-blur-sm py-3 overflow-hidden my-8">
          <style>{`
            @keyframes marqueeScroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .marquee-track {
              animation: marqueeScroll 30s linear infinite;
              display: flex;
              width: max-content;
            }
            .marquee-track:hover { animation-play-state: paused; }
          `}</style>
          <div className="marquee-track flex items-center gap-10 whitespace-nowrap">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <span key={i} className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-subtle/70">
                <span className="text-accent text-[10px]">◆</span>
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* ── WIDGET GALLERY ── */}
        <section id="widgets" className="mx-auto max-w-7xl px-5 md:px-10 py-20">
          <motion.div
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent mb-3">14 Overlay Widgets</p>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Widgets That Do
              <br />
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(90deg, #f5c451, #e8a020)" }}
              >
                The Heavy Lifting
              </span>
            </h2>
            <p className="text-subtle max-w-xl mx-auto">
              Every widget syncs live with your Twitch chat and dashboard. No page refreshes, no delays.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" style={{ perspective: "1200px" }}>
            {WIDGETS.map((w, i) => (
              <Widget3DCard key={w.kind} kind={w.kind} label={w.label} index={i} />
            ))}
          </div>
        </section>

        {/* ── FEATURES GRID ── */}
        <section id="features" className="mx-auto max-w-7xl px-5 md:px-10 py-20">
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent mb-3">Full Feature Set</p>
            <h2 className="text-4xl md:text-5xl font-black">Everything You Need</h2>
            <div className="mt-3 h-1 w-16 rounded-full bg-gradient-to-r from-accent to-rose-600" />
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
          >
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                className="group flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.03] hover:border-accent/30 hover:bg-accent/5 transition-all duration-300 p-4"
              >
                <div className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-md bg-gradient-to-br from-accent/30 to-rose-700/20 flex items-center justify-center">
                  <span className="text-accent text-xs">✦</span>
                </div>
                <p className="text-sm text-subtle group-hover:text-text transition-colors leading-relaxed">{feature}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="mx-auto max-w-5xl px-5 md:px-10 py-20">
          <motion.div
            className="mb-14 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent mb-3">Setup in Minutes</p>
            <h2 className="text-4xl md:text-5xl font-black">How It Works</h2>
            <div className="mt-3 h-1 w-16 rounded-full bg-gradient-to-r from-accent to-rose-600 mx-auto" />
          </motion.div>

          <div className="relative">
            {/* Vertical connector line */}
            <div
              className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-accent/50 via-accent/20 to-transparent"
              style={{ transform: "translateX(-50%)" }}
            />

            <div className="space-y-8">
              {workflow.map((step, idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <motion.div
                    key={step.id}
                    className={`relative flex gap-8 ${isEven ? "md:flex-row" : "md:flex-row-reverse"} flex-row`}
                    initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                  >
                    {/* Step number bubble */}
                    <div className="absolute left-8 md:left-1/2 top-6 -translate-x-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center font-black text-black text-sm shadow-lg shadow-accent/30"
                      style={{ background: "linear-gradient(135deg, #f5c451, #e8a020)" }}
                    >
                      {step.id}
                    </div>

                    {/* Content block */}
                    <div className={`ml-20 md:ml-0 md:w-[calc(50%-2.5rem)] ${isEven ? "md:pr-10" : "md:pl-10 md:ml-auto"}`}>
                      <div className="rounded-2xl border border-white/5 bg-white/[0.03] hover:border-accent/30 hover:bg-accent/5 transition-all duration-300 p-6">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-black">{step.title}</h3>
                          <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent uppercase tracking-wider">
                            {idx === 0 ? "1–2 min" : idx === 1 ? "2–3 min" : "instant"}
                          </span>
                        </div>
                        <p className="text-subtle text-sm leading-relaxed">{step.text}</p>
                      </div>
                    </div>

                    {/* Spacer for other side */}
                    <div className="hidden md:block md:w-[calc(50%-2.5rem)]" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section id="pricing" className="mx-auto max-w-6xl px-5 md:px-10 py-20">
          <motion.div
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent mb-3">Transparent Pricing</p>
            <h2 className="text-4xl md:text-5xl font-black">Pick Your Plan</h2>
            <div className="mt-3 h-1 w-16 rounded-full bg-gradient-to-r from-accent to-rose-600 mx-auto" />
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {/* Starter */}
            <motion.div
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
            >
              <p className="text-xs font-bold uppercase tracking-widest text-subtle mb-1">Starter</p>
              <p className="text-5xl font-black mb-1">Free</p>
              <p className="text-sm text-subtle mb-6">Get started, no card required</p>
              <ul className="space-y-3 text-sm text-subtle mb-8 flex-1">
                {["1 channel", "Hotwords widget", "Slot Requests widget", "Twitch chat bot"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="text-accent">✓</span> {item}
                    </li>
                  )
                )}
              </ul>
              <Link
                href={dashboardHref}
                className="block w-full rounded-xl border border-accent/30 py-3 text-center font-bold text-accent hover:bg-accent/10 transition-colors"
              >
                Start Free
              </Link>
            </motion.div>

            {/* Pro — Popular */}
            <motion.div
              className="rounded-2xl border border-accent/40 p-8 relative overflow-hidden flex flex-col"
              style={{ background: "linear-gradient(145deg, rgba(245,196,81,0.08) 0%, rgba(178,34,52,0.08) 100%)" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="absolute top-4 right-4 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-black"
                style={{ background: "linear-gradient(135deg, #f5c451, #e8a020)" }}
              >
                Popular
              </div>
              <div className="absolute inset-0 rounded-2xl ring-1 ring-accent/40 pointer-events-none" />
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
              <p className="text-xs font-bold uppercase tracking-widest text-accent mb-1">Pro</p>
              <p className="text-5xl font-black mb-1">
                150€<span className="text-xl text-subtle font-normal">/mo</span>
              </p>
              <p className="text-sm text-subtle mb-6">For serious streamers</p>
              <ul className="space-y-3 text-sm text-subtle mb-8 flex-1">
                {["1 channel", "All 13 widget types", "Unlimited overlays", "Priority support"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="text-accent">✓</span> {item}
                    </li>
                  )
                )}
              </ul>
              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={() => setCheckout({ plan: "pro" })}
                  className="block w-full rounded-xl py-3 text-center font-black text-black transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #f5c451, #e8a020)" }}
                >
                  Get Pro
                </button>
              ) : (
                <a
                  href={`/auth?next=${encodeURIComponent("/?checkout=pro")}`}
                  className="block w-full rounded-xl py-3 text-center font-black text-black transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #f5c451, #e8a020)" }}
                >
                  Get Pro
                </a>
              )}
            </motion.div>

            {/* Enterprise */}
            <motion.div
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-xs font-bold uppercase tracking-widest text-subtle mb-1">Enterprise</p>
              <p className="text-5xl font-black mb-1">
                300€<span className="text-xl text-subtle font-normal">/mo</span>
              </p>
              <p className="text-sm text-subtle mb-6">Full version — no limits</p>
              <ul className="space-y-3 text-sm text-subtle mb-8 flex-1">
                {[
                  "1 channel",
                  "All 13 widget types",
                  "Public landing page",
                  "Frontpages (viewer URLs)",
                  "Priority enterprise support",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="text-accent">✓</span> {item}
                  </li>
                ))}
              </ul>
              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={() => setCheckout({ plan: "enterprise" })}
                  className="block w-full rounded-xl border border-accent/30 py-3 text-center font-bold text-accent hover:bg-accent/10 transition-colors"
                >
                  Get Enterprise
                </button>
              ) : (
                <a
                  href={`/auth?next=${encodeURIComponent("/?checkout=enterprise")}`}
                  className="block w-full rounded-xl border border-accent/30 py-3 text-center font-bold text-accent hover:bg-accent/10 transition-colors"
                >
                  Get Enterprise
                </a>
              )}
            </motion.div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="mx-auto max-w-3xl px-5 md:px-10 py-20">
          <motion.div
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
          >
            <h2 className="text-4xl md:text-5xl font-black">FAQ</h2>
            <div className="mt-3 h-1 w-16 rounded-full bg-gradient-to-r from-accent to-rose-600 mx-auto" />
          </motion.div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, idx) => (
              <motion.div
                key={item.q}
                className="rounded-xl border border-white/5 bg-white/[0.03] overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-white/[0.03] transition-colors"
                >
                  <span className="font-bold text-sm md:text-base">{item.q}</span>
                  <motion.span
                    className="flex-shrink-0 ml-4 text-accent text-xl leading-none"
                    animate={{ rotate: openFaq === idx ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    +
                  </motion.span>
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 text-sm text-subtle leading-relaxed border-t border-white/5 pt-3">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="mx-auto max-w-4xl px-5 md:px-10 pb-20">
          <motion.div
            className="relative rounded-3xl overflow-hidden p-10 md:p-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/15 via-rose-700/10 to-accent/5" />
            <div className="absolute inset-0 border border-accent/25 rounded-3xl pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent mb-4">Ready to Stream?</p>
              <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
                Level Up Your
                <br />
                <span
                  className="text-transparent bg-clip-text"
                  style={{ backgroundImage: "linear-gradient(135deg, #f5c451, #e8a020)" }}
                >
                  Casino Streams
                </span>
              </h2>
              <p className="text-subtle mb-8 max-w-xl mx-auto">
                Join thousands of casino streamers who trust Pulseframelabs for their live operations.
              </p>
              <Link
                href={dashboardHref}
                className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-black text-black text-base shadow-xl hover:shadow-accent/50 hover:scale-105 transition-all duration-300"
                style={{ background: "linear-gradient(135deg, #f5c451, #e8a020)" }}
              >
                {isLoggedIn ? "Open Dashboard" : "Create Account — Free"}
                <span>→</span>
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 bg-black/20 backdrop-blur-sm relative z-10">
        <div className="mx-auto max-w-7xl px-5 md:px-10 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BrandIcon size="sm" />
            <span className="text-sm font-black tracking-wider text-subtle">PULSEFRAMELABS</span>
          </div>
          <p className="text-xs text-subtle/60">© {new Date().getFullYear()} Pulseframelabs. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#widgets" className="text-xs text-subtle/60 hover:text-subtle transition-colors">
              Widgets
            </a>
            <a href="#features" className="text-xs text-subtle/60 hover:text-subtle transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-xs text-subtle/60 hover:text-subtle transition-colors">
              Pricing
            </a>
          </div>
        </div>
      </footer>

      {/* ── MOBILE STICKY CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 bg-bg/90 backdrop-blur-md p-3 md:hidden">
        <Link
          href={dashboardHref}
          className="block w-full rounded-xl py-3 text-center font-black text-black"
          style={{ background: "linear-gradient(135deg, #f5c451, #e8a020)" }}
        >
          {isLoggedIn ? "Open Dashboard" : "Start Free"}
        </Link>
      </div>
    </div>

    {checkout && (
      <CheckoutModal plan={checkout.plan} onClose={() => setCheckout(null)} />
    )}
    </>
  );
}
