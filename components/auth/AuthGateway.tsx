"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AuthLayout } from "./AuthLayout";

type Mode = "login" | "register";

type AuthGatewayProps = {
  nextPath: string;
};

type ApiError = {
  error?: string;
};

export function AuthGateway({ nextPath }: AuthGatewayProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const submitLabel = useMemo(() => {
    return mode === "login" ? "Sign In" : "Create Account";
  }, [mode]);
  const twitchAuthUrl = `/api/auth/twitch/start?next=${encodeURIComponent(nextPath)}`;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          displayName: mode === "register" ? displayName : undefined
        })
      });

      const payload = (await res.json().catch(() => ({}))) as ApiError;
      if (!res.ok) {
        setError(payload.error ?? "Authentication failed.");
        return;
      }

      window.location.assign(nextPath);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthLayout mode={mode}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-text">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-subtle text-sm">
            {mode === "login"
              ? "Sign in to access your dashboard."
              : "Create an account and start managing your casino streams."}
          </p>
        </div>

        {/* Mode Toggle */}
        <motion.div
          className="mb-8 grid grid-cols-2 gap-2 p-1 rounded-lg border border-accent/20 bg-accent/5 backdrop-blur-sm"
          layout
        >
          {(["login", "register"] as const).map((m) => (
            <motion.button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`relative py-2.5 px-4 text-sm font-semibold rounded-md transition-colors duration-300 ${
                mode === m
                  ? "text-black"
                  : "text-subtle hover:text-text"
              }`}
              whileTap={{ scale: 0.98 }}
            >
              {mode === m && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-accent to-rose-700 rounded-md"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  style={{ zIndex: -1 }}
                />
              )}
              {m === "login" ? "Sign In" : "Register"}
            </motion.button>
          ))}
        </motion.div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-5">
          {mode === "register" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <label className="block space-y-2.5">
                <span className="text-sm font-medium text-text">Display Name</span>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-accent/20 bg-accent/5 backdrop-blur-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all duration-300 placeholder:text-subtle/50"
                  placeholder="Your name"
                />
              </label>
            </motion.div>
          )}

          <div>
            <label className="block space-y-2.5">
              <span className="text-sm font-medium text-text">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-accent/20 bg-accent/5 backdrop-blur-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all duration-300 placeholder:text-subtle/50"
                placeholder="name@example.com"
              />
            </label>
          </div>

          <div>
            <label className="block space-y-2.5">
              <span className="text-sm font-medium text-text">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 rounded-lg border border-accent/20 bg-accent/5 backdrop-blur-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all duration-300 placeholder:text-subtle/50"
                placeholder="At least 8 characters"
              />
            </label>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-danger/30 bg-danger/10 backdrop-blur-sm px-4 py-3 text-sm text-danger"
            >
              {error}
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={pending}
            className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-accent to-rose-700 font-semibold text-black hover:shadow-lg hover:shadow-accent/40 disabled:cursor-not-allowed disabled:opacity-70 transition-all duration-300"
            whileTap={{ scale: 0.98 }}
          >
            {pending ? "Please wait..." : submitLabel}
          </motion.button>
        </form>

        <div className="mt-6">
          <p className="mb-3 text-xs uppercase tracking-[0.16em] text-subtle">Optional</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <a
              href={twitchAuthUrl}
              className="rounded-lg border border-accent/25 bg-accent/5 px-4 py-3 text-sm font-medium text-text hover:border-accent/45 transition-colors duration-300 text-center"
            >
              Continue with Twitch
            </a>
            <button
              type="button"
              disabled
              className="rounded-lg border border-accent/15 bg-accent/5 px-4 py-3 text-sm font-medium text-subtle/70 text-center cursor-not-allowed"
            >
              Continue with Discord (Soon)
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-8 pt-6 border-t border-accent/10 text-center"
        >
          <p className="text-sm text-subtle">
            Back to{" "}
            <Link
              href="/"
              className="text-accent font-semibold hover:text-amber-300 transition-colors duration-300"
            >
              Home
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </AuthLayout>
  );
}
