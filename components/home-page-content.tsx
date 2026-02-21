"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { AnimatedBackground } from "@/components/ui/animated-background";

interface HomePageContentProps {
  isLoggedIn: boolean;
  features: string[];
  workflow: Array<{ id: string; title: string; text: string }>;
}

export function HomePageContent({
  isLoggedIn,
  features,
  workflow
}: HomePageContentProps) {
  const [activePreview, setActivePreview] = useState<"overlays" | "viewer-pages" | "moderation">("overlays");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const previewTabs = [
    {
      id: "overlays" as const,
      title: "Overlays",
      description: "Build, duplicate and publish OBS-ready overlays with tokenized URLs and instant actions."
    },
    {
      id: "viewer-pages" as const,
      title: "Viewer Pages",
      description: "Create casino front pages with your offers, current bonus hunts and dynamic content blocks."
    },
    {
      id: "moderation" as const,
      title: "Moderation",
      description: "Assign roles, control permissions and track events through exportable logs."
    }
  ];

  const faqItems = [
    {
      q: "How fast can I go live with an overlay?",
      a: "Most channels are live in under 5 minutes: create overlay, publish, copy browser source URL, paste into OBS."
    },
    {
      q: "Do I need technical setup knowledge?",
      a: "No advanced setup is required. The dashboard guides each step and keeps token management simple."
    },
    {
      q: "Can I control moderator permissions?",
      a: "Yes. Permissions are role-based, so mods only get access to actions you explicitly allow."
    },
    {
      q: "Can I test before paying?",
      a: "Yes. Start with the free flow and upgrade when you need more scale and advanced controls."
    }
  ];

  return (
    <div className="min-h-screen bg-bg text-text overflow-hidden relative">
      <AnimatedBackground />
      <motion.header
        className="relative border-b border-accent/20 backdrop-blur-xl bg-bg/80 z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 md:px-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-rose-700 flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-lg font-bold tracking-wider">ELEMENTS</span>
          </div>
          <nav className="flex items-center gap-6 md:gap-8">
            <Link href="#features" className="text-sm text-subtle hover:text-accent transition-colors duration-300">
              Features
            </Link>
            <Link href="#benefits" className="text-sm text-subtle hover:text-accent transition-colors duration-300">
              Benefits
            </Link>
            <Link
              href={isLoggedIn ? "/overlays" : "/auth"}
              className="px-6 py-2.5 bg-gradient-to-r from-accent to-rose-700 rounded-lg font-semibold text-black hover:shadow-lg hover:shadow-accent/50 transition-all duration-300"
            >
              {isLoggedIn ? "Dashboard" : "Get Started"}
            </Link>
          </nav>
        </div>
      </motion.header>

      <main className="mx-auto w-full px-6 md:px-10 relative z-10">
        {/* Hero Section */}
        <motion.section
          className="max-w-6xl mx-auto py-16 md:py-28 grid md:grid-cols-2 gap-8 md:gap-12 items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="inline-block mb-4 px-3 py-1.5 border border-accent/40 rounded-full bg-accent/10 backdrop-blur-sm">
              <span className="text-xs font-semibold text-accent uppercase tracking-wider">All-in-One Solution</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
              Manage your <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-amber-300">Casino Streams</span> like a Pro
            </h1>
            <p className="text-lg text-subtle mb-8 leading-relaxed">
              Create custom pages and OBS overlays for your viewers. Manage casino offers and bonushunts on one powerful platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={isLoggedIn ? "/overlays" : "/auth"}
                className="px-8 py-3.5 bg-gradient-to-r from-accent to-rose-700 rounded-lg font-bold text-black hover:shadow-xl hover:shadow-accent/40 transition-all duration-300 text-center"
              >
                {isLoggedIn ? "Open Dashboard" : "Start Free"}
              </Link>
              <Link
                href="#features"
                className="px-8 py-3.5 border-2 border-accent/40 rounded-lg font-semibold text-accent hover:border-accent hover:bg-accent/5 transition-all duration-300 text-center"
              >
                Explore Features
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-rose-700/20 rounded-2xl blur-3xl" />
            <div
              className="relative w-full max-w-[560px] min-h-[260px] md:ml-auto rounded-2xl border border-accent/30 bg-black overflow-hidden"
              style={{ aspectRatio: "4 / 3" }}
            >
              <video
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 z-10 w-full h-full max-w-full max-h-full object-cover object-center transform-none"
              >
                <source src="https://freestock-transcoded-videos-prod.s3.us-east-1.amazonaws.com/transcoded/freestock_v4474997.mp4" type="video/mp4" />
              </video>
              {/* Fallback: Animated gradient background if video fails to load */}
              <div className="absolute inset-0 z-0 bg-gradient-to-br from-accent/20 via-rose-700/15 to-accent/10 animate-pulse" />
            </div>
          </motion.div>
        </motion.section>

        {/* Trust Strip */}
        <motion.section
          className="max-w-6xl mx-auto py-8"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="rounded-2xl border border-accent/20 bg-gradient-to-r from-accent/10 to-rose-700/10 p-5 md:p-6">
            <div className="grid gap-4 md:grid-cols-[1.2fr_2fr] md:items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold mb-2">Trusted Streaming Stack</p>
                <p className="text-sm text-subtle">Built for casino stream workflows, from quick setup to production-level control.</p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg border border-accent/20 bg-bg/40 px-3 py-3">
                  <p className="text-2xl font-bold text-accent">10k+</p>
                  <p className="text-xs text-subtle">Active Streamers</p>
                </div>
                <div className="rounded-lg border border-accent/20 bg-bg/40 px-3 py-3">
                  <p className="text-2xl font-bold text-accent">99.9%</p>
                  <p className="text-xs text-subtle">Platform Uptime</p>
                </div>
                <div className="rounded-lg border border-accent/20 bg-bg/40 px-3 py-3">
                  <p className="text-2xl font-bold text-accent">&lt;5m</p>
                  <p className="text-xs text-subtle">Avg. Setup Time</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section
          className="max-w-6xl mx-auto py-12 grid grid-cols-3 gap-4 md:gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          {[
            { value: "10k+", label: "Active Streamers" },
            { value: "50M+", label: "Monthly Viewers" },
            { value: "99.9%", label: "Uptime" }
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              className="p-6 rounded-xl border border-accent/20 bg-accent/5 backdrop-blur-sm hover:border-accent/40 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
            >
              <div className="text-3xl font-bold text-accent mb-2">{stat.value}</div>
              <div className="text-sm text-subtle">{stat.label}</div>
            </motion.div>
          ))}
        </motion.section>

        {/* Product Preview Tabs */}
        <motion.section
          className="max-w-6xl mx-auto py-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-120px" }}
        >
          <div className="mb-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Product Preview</h2>
            <div className="h-1 w-16 bg-gradient-to-r from-accent to-rose-600 rounded-full" />
          </div>

          <div className="grid gap-6 md:grid-cols-[1fr_1.4fr]">
            <div className="space-y-3">
              {previewTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActivePreview(tab.id)}
                  className={`w-full rounded-xl border p-4 text-left transition-all duration-300 ${
                    activePreview === tab.id
                      ? "border-accent/50 bg-gradient-to-r from-accent/15 to-rose-700/15"
                      : "border-accent/20 bg-accent/5 hover:border-accent/35"
                  }`}
                >
                  <p className="text-lg font-semibold">{tab.title}</p>
                  <p className="mt-1 text-sm text-subtle">{tab.description}</p>
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-accent/25 bg-bg-deep/80 p-6 md:p-8">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.18em] text-accent font-semibold">Live UI Snapshot</p>
                <p className="text-xs text-subtle">Mode: {activePreview.replace("-", " ")}</p>
              </div>
              <div className="rounded-xl border border-accent/25 bg-gradient-to-br from-accent/10 to-rose-700/10 p-5">
                <div className="mb-4 flex gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border border-accent/20 bg-bg/50 p-3">
                    <p className="text-xs text-subtle mb-1">Panel</p>
                    <p className="text-sm font-semibold">{activePreview === "overlays" ? "Overlay Actions" : activePreview === "viewer-pages" ? "Page Components" : "Permission Matrix"}</p>
                  </div>
                  <div className="rounded-lg border border-accent/20 bg-bg/50 p-3">
                    <p className="text-xs text-subtle mb-1">Status</p>
                    <p className="text-sm font-semibold">Connected and Ready</p>
                  </div>
                  <div className="rounded-lg border border-accent/20 bg-bg/50 p-3 md:col-span-2">
                    <p className="text-xs text-subtle mb-1">Preview</p>
                    <div className="h-24 rounded-md bg-gradient-to-r from-accent/25 via-rose-700/25 to-accent/10" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Interactive Demo */}
        <motion.section
          className="max-w-6xl mx-auto py-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
        >
          <div className="mb-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Interactive Demo</h2>
            <div className="h-1 w-16 bg-gradient-to-r from-accent to-rose-600 rounded-full" />
          </div>
          <div className="rounded-2xl border border-accent/25 bg-gradient-to-br from-accent/10 to-rose-700/10 p-6 md:p-8">
            <div className="grid gap-6 md:grid-cols-[1fr_1.4fr]">
              <div className="space-y-3">
                {["Show Bonus Hunt Overlay", "Trigger Offer Banner", "Switch Viewer Panel", "Log Moderator Action"].map((action) => (
                  <button
                    key={action}
                    type="button"
                    className="w-full rounded-lg border border-accent/25 bg-bg/60 px-4 py-3 text-left text-sm font-medium hover:border-accent/50 transition-colors duration-300"
                  >
                    {action}
                  </button>
                ))}
              </div>
              <div className="rounded-xl border border-accent/25 bg-bg/65 p-5">
                <p className="text-xs uppercase tracking-[0.16em] text-accent font-semibold mb-4">Simulated Live Output</p>
                <div className="h-40 rounded-lg border border-accent/20 bg-gradient-to-br from-accent/20 to-rose-700/20 mb-4" />
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-md border border-accent/20 bg-bg/50 p-3 text-center">
                    <p className="text-lg font-bold text-accent">+42%</p>
                    <p className="text-[11px] text-subtle">Engagement</p>
                  </div>
                  <div className="rounded-md border border-accent/20 bg-bg/50 p-3 text-center">
                    <p className="text-lg font-bold text-accent">1.1s</p>
                    <p className="text-[11px] text-subtle">Response</p>
                  </div>
                  <div className="rounded-md border border-accent/20 bg-bg/50 p-3 text-center">
                    <p className="text-lg font-bold text-accent">Live</p>
                    <p className="text-[11px] text-subtle">Sync</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section
          id="features"
          className="max-w-6xl mx-auto py-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Powerful Features</h2>
            <div className="h-1 w-16 bg-gradient-to-r from-accent to-rose-600 rounded-full" />
          </div>
          <motion.div
            className="grid md:grid-cols-3 gap-6"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.slice(0, 6).map((feature, idx) => (
              <motion.div
                key={idx}
                className="p-6 rounded-xl border border-accent/20 bg-accent/5 backdrop-blur-sm hover:border-accent/40 hover:bg-accent/10 transition-all duration-300"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-rose-700 flex items-center justify-center mb-4">
                  <span className="text-sm font-bold text-white">{idx + 1}</span>
                </div>
                <p className="text-sm leading-relaxed">{feature}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Use Cases */}
        <motion.section
          className="max-w-6xl mx-auto py-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Casino Use Cases</h2>
            <div className="h-1 w-16 bg-gradient-to-r from-accent to-rose-600 rounded-full" />
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Slots Streams",
                text: "Rotate promos automatically, highlight current offers and keep chat-facing visuals updated in real time."
              },
              {
                title: "Roulette Nights",
                text: "Drive anticipation with dynamic overlays for betting phases, payouts and session highlights."
              },
              {
                title: "Crash Sessions",
                text: "Surface fast-changing data in clean widgets so viewers follow decisions without clutter."
              }
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-accent/20 bg-accent/5 p-6 backdrop-blur-sm">
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-sm text-subtle leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* How It Works */}
        <motion.section
          id="benefits"
          className="max-w-6xl mx-auto py-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
            <div className="h-1 w-16 bg-gradient-to-r from-accent to-rose-600 rounded-full" />
          </div>
          <motion.div
            className="space-y-6"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.15 }
              }
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {workflow.map((step, idx) => (
              <motion.div
                key={step.id}
                className="relative flex gap-6 items-start p-6 rounded-xl border border-accent/20 hover:border-accent/40 bg-accent/5 hover:bg-accent/10 backdrop-blur-sm transition-all duration-300"
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 }
                }}
              >
                {idx < workflow.length - 1 && (
                  <div className="absolute left-[29px] top-[62px] bottom-[-24px] w-px bg-accent/30" />
                )}
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-accent to-rose-700 flex items-center justify-center font-bold text-black text-lg">
                  {step.id}
                </div>
                <div>
                  <div className="mb-2 flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{step.title}</h3>
                    <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[11px] text-accent">
                      {idx === 0 ? "1-2 min" : idx === 1 ? "2-3 min" : "under 1 min"}
                    </span>
                  </div>
                  <p className="text-subtle">{step.text}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Pricing Preview */}
        <motion.section
          className="max-w-6xl mx-auto py-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Pricing Preview</h2>
            <div className="h-1 w-16 bg-gradient-to-r from-accent to-rose-600 rounded-full" />
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-accent/20 bg-accent/5 p-8">
              <p className="text-sm uppercase tracking-[0.16em] text-subtle mb-2">Starter</p>
              <p className="text-4xl font-bold mb-4">Free</p>
              <ul className="space-y-3 text-sm text-subtle">
                <li>1 channel setup</li>
                <li>Core overlay + viewer tools</li>
                <li>Basic moderation access</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-accent/40 bg-gradient-to-br from-accent/10 to-rose-700/10 p-8">
              <p className="text-sm uppercase tracking-[0.16em] text-accent mb-2">Pro</p>
              <p className="text-4xl font-bold mb-4">150€<span className="text-lg text-subtle">/mo</span></p>
              <ul className="space-y-3 text-sm text-subtle">
                <li>Slimmed-down version for small teams</li>
                <li>Limited overlays and front pages</li>
                <li>Standard Support</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-accent/40 bg-gradient-to-br from-rose-700/15 to-accent/15 p-8">
              <p className="text-sm uppercase tracking-[0.16em] text-accent mb-2">Enterprise</p>
              <p className="text-4xl font-bold mb-4">300€<span className="text-lg text-subtle">/mo</span></p>
              <ul className="space-y-3 text-sm text-subtle">
                <li>All features unlimited</li>
                <li>Unlimited overlays, front pages, and roles</li>
                <li>Prioritized enterprise support</li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* FAQ */}
        <motion.section
          className="max-w-6xl mx-auto py-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">FAQ</h2>
            <div className="h-1 w-16 bg-gradient-to-r from-accent to-rose-600 rounded-full" />
          </div>
          <div className="space-y-3">
            {faqItems.map((item, idx) => (
              <div key={item.q} className="rounded-xl border border-accent/20 bg-accent/5">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <span className="font-semibold">{item.q}</span>
                  <span className="text-accent text-xl leading-none">{openFaq === idx ? "-" : "+"}</span>
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-4 text-sm text-subtle">{item.a}</div>
                )}
              </div>
            ))}
          </div>
        </motion.section>

        {/* Security */}
        <motion.section
          className="max-w-6xl mx-auto py-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="rounded-2xl border border-accent/25 bg-gradient-to-br from-accent/10 to-rose-700/10 p-6 md:p-10">
            <p className="text-xs uppercase tracking-[0.18em] text-accent font-semibold mb-3">Security and Control</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Built for secure stream operations</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-accent/20 bg-bg/45 p-4">
                <p className="font-semibold mb-1">Token-based Access</p>
                <p className="text-sm text-subtle">Rotate and revoke overlay/viewer tokens instantly from the dashboard.</p>
              </div>
              <div className="rounded-lg border border-accent/20 bg-bg/45 p-4">
                <p className="font-semibold mb-1">Role Permissions</p>
                <p className="text-sm text-subtle">Fine-grained moderator permissions prevent accidental high-impact changes.</p>
              </div>
              <div className="rounded-lg border border-accent/20 bg-bg/45 p-4">
                <p className="font-semibold mb-1">Action Logging</p>
                <p className="text-sm text-subtle">Track key actions with exportable logs for audit and incident review.</p>
              </div>
              <div className="rounded-lg border border-accent/20 bg-bg/45 p-4">
                <p className="font-semibold mb-1">Operational Stability</p>
                <p className="text-sm text-subtle">Designed for always-on broadcasts with minimal dashboard friction.</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          className="max-w-4xl mx-auto py-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="p-12 rounded-2xl border border-accent/40 bg-gradient-to-br from-accent/10 to-rose-700/10 backdrop-blur-xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to level up your casino streams?</h2>
            <p className="text-lg text-subtle mb-8 max-w-2xl mx-auto">
              Join thousands of streamers who are already managing their casino streams with Elements.
            </p>
            <Link
              href={isLoggedIn ? "/overlays" : "/auth"}
              className="inline-block px-8 py-4 bg-gradient-to-r from-accent to-rose-700 rounded-lg font-bold text-black hover:shadow-xl hover:shadow-accent/40 transition-all duration-300"
            >
              {isLoggedIn ? "Go to Dashboard" : "Create Account Free"}
            </Link>
          </div>
        </motion.section>
      </main>

      <footer className="border-t border-accent/20 bg-bg/50 backdrop-blur-sm mt-20 relative z-10">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-8">
          <p className="text-xs text-subtle text-center">
            © {new Date().getFullYear()} Elements. All rights reserved.
          </p>
        </div>
      </footer>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-accent/25 bg-bg/95 p-3 backdrop-blur-md md:hidden">
        <Link
          href={isLoggedIn ? "/overlays" : "/auth"}
          className="block w-full rounded-lg bg-gradient-to-r from-accent to-rose-700 px-4 py-3 text-center font-bold text-black"
        >
          {isLoggedIn ? "Open Dashboard" : "Start Free"}
        </Link>
      </div>
    </div>
  );
}
