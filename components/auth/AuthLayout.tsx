"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { VideoPanel } from "./VideoPanel";

interface AuthLayoutProps {
  children: ReactNode;
  mode: "login" | "register";
}

export function AuthLayout({ children, mode }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-bg overflow-hidden">
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-[2fr_3fr]">
        {/* Video Panel - Left (40%) */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="min-h-[40vh] md:min-h-screen md:border-r-8 md:border-accent/30"
        >
          <VideoPanel />
        </motion.div>

        {/* Form Panel - Right (60%) */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex min-h-screen items-center justify-center px-4 py-8 md:px-10 lg:px-14"
        >
          <div className="w-full max-w-xl rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/5 to-rose-700/10 backdrop-blur-xl p-8 md:p-10">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
