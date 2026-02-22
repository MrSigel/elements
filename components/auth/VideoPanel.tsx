"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const FLOATING_CARDS = [
  { src: "/overlay/bonushunt.webp", top: "8%", left: "5%", rot: "-4deg", delay: 0, scale: 1 },
  { src: "/overlay/slot_vs_slot_battles.png", top: "30%", right: "4%", rot: "3.5deg", delay: 0.6, scale: 0.9 },
  { src: "/overlay/quick_fuesses_twitch.webp", top: "55%", left: "8%", rot: "-2deg", delay: 1.1, scale: 0.85 },
  { src: "/overlay/viewer_tournaments.webp", top: "72%", right: "6%", rot: "5deg", delay: 0.3, scale: 0.8 },
];

export function VideoPanel() {
  return (
    <div className="relative w-full h-full min-h-[40vh] md:min-h-screen overflow-hidden bg-bg-deep">
      {/* Base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 80% at 30% 20%, rgba(245,196,81,0.12) 0%, transparent 60%), radial-gradient(ellipse 80% 100% at 70% 80%, rgba(178,34,52,0.10) 0%, transparent 55%), #0a0f14",
        }}
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(245,196,81,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(245,196,81,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Floating widget screenshots */}
      {FLOATING_CARDS.map((card, i) => (
        <motion.div
          key={i}
          className="absolute w-[220px] md:w-[260px] rounded-xl overflow-hidden border border-accent/25 shadow-2xl"
          style={{
            top: card.top,
            left: "left" in card ? card.left : undefined,
            right: "right" in card ? card.right : undefined,
            rotate: card.rot,
            boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(245,196,81,0.1)",
          }}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{
            opacity: 1,
            scale: card.scale,
            y: [0, -10, 0],
          }}
          transition={{
            opacity: { duration: 0.6, delay: card.delay },
            scale: { duration: 0.6, delay: card.delay },
            y: {
              repeat: Infinity,
              duration: 4 + i * 0.7,
              delay: card.delay,
              ease: "easeInOut",
            },
          }}
        >
          <Image
            src={card.src}
            alt="Widget preview"
            width={520}
            height={310}
            className="w-full h-auto object-cover"
            priority={i === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </motion.div>
      ))}

      {/* Bottom content */}
      <div className="absolute inset-0 flex flex-col items-start justify-end p-8 md:p-10 z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
        >
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 border border-accent/40 rounded-full bg-black/50 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-bold text-accent uppercase tracking-widest">Casino Stream Platform</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black leading-tight text-text mb-3 max-w-xs">
            Stream Like a{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, #f5c451, #e8a020)" }}
            >
              High Roller
            </span>
          </h2>
          <p className="text-subtle text-sm leading-relaxed max-w-xs">
            OBS overlays, Twitch bot, loyalty system — all connected and live.
          </p>
        </motion.div>
      </div>

      {/* Top gradient fade for readability */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-bg-deep/60 to-transparent z-10" />
      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-bg-deep/90 to-transparent z-10" />
    </div>
  );
}
