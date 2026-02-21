"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function VideoPanel() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <motion.div
      className="relative w-full h-full min-h-[40vh] md:min-h-screen bg-bg overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full bg-black overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full max-w-full max-h-full object-cover object-center transform-none"
        >
          <source src="https://freestock-transcoded-videos-prod.s3.us-east-1.amazonaws.com/transcoded/freestock_v4475000.mp4" type="video/mp4" />
        </video>
        {/* Fallback: Animated gradient if video fails */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-rose-700/15 to-accent/10 animate-pulse" />
      </div>

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
      
      {/* Optional: Subtle noise texture */}
      <div className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlUGVydGluTm9pc2UgdHlwZT0iZnJhY3RhbE5vaXNlIiBiYXNlRnJlcXVlbmN5PSIwLjkiIG51bU9jdGF2ZXM9IjQiIHNlZWQ9IjIiIC8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI25vaXNlKSIgLz48L3N2Zz4=')] opacity-20" />

      {/* Content - Positioned at bottom */}
      <div className="absolute inset-0 flex flex-col items-start justify-end p-8 md:p-10 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="mb-4 inline-block px-3 py-1.5 border border-accent/40 rounded-full bg-accent/10 backdrop-blur-sm">
            <span className="text-xs font-semibold text-accent uppercase tracking-wider">Pro Features</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold leading-tight text-text mb-3 max-w-md">
            Stream Management Done Right
          </h2>
          <p className="text-subtle text-sm leading-relaxed max-w-sm">
            Manage your casino overlays and offers with confidence. Built for professional streamers.
          </p>
        </motion.div>
      </div>

      {/* Accent Border Glow */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-accent/20 to-transparent rounded-full blur-2xl pointer-events-none" />
    </motion.div>
  );
}
