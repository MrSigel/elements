"use client";

import { useEffect, useRef, useState } from "react";

type ChatMessage = {
  id: string;
  sender: "viewer" | "agent" | "system";
  body: string;
  created_at: string;
};

const BASE_SESSION_KEY = "dashboard-livechat-session";

export function DashboardLiveChatWidget({ userId }: { userId?: string }) {
  const sessionKey = userId ? `${BASE_SESSION_KEY}-${userId}` : BASE_SESSION_KEY;
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [sessionToken, setSessionToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  function normalizeError(raw: string) {
    if (raw.startsWith("telegram_api_error")) return "Telegram API error. Please verify bot token and chat ID.";
    if (raw === "telegram_not_configured") return "Support chat is not configured yet.";
    return raw;
  }

  useEffect(() => {
    // Reset session state whenever the user changes
    setSessionId("");
    setSessionToken("");
    setMessages([]);

    const raw = window.localStorage.getItem(sessionKey);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as { sessionId?: string; sessionToken?: string };
      if (parsed.sessionId && parsed.sessionToken) {
        setSessionId(parsed.sessionId);
        setSessionToken(parsed.sessionToken);
      }
    } catch {
      // ignore malformed local storage payload
    }
  }, [sessionKey]);

  useEffect(() => {
    if (!sessionId || !sessionToken) return;
    const run = async (syncTelegram = false) => {
      const url = `/api/livechat/messages?sessionId=${encodeURIComponent(sessionId)}&sessionToken=${encodeURIComponent(sessionToken)}${syncTelegram ? "&sync=1" : ""}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { messages?: ChatMessage[] };
      setMessages(data.messages ?? []);
    };
    void run(true);
    const dbTimer = window.setInterval(() => void run(false), 2500);
    const telegramSyncTimer = window.setInterval(() => void run(true), 7000);
    return () => {
      window.clearInterval(dbTimer);
      window.clearInterval(telegramSyncTimer);
    };
  }, [sessionId, sessionToken]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function ensureSession() {
    if (sessionId && sessionToken) return { sessionId, sessionToken };
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/livechat/dashboard/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = (await res.json()) as { sessionId?: string; sessionToken?: string; error?: string };
      if (!res.ok || !data.sessionId || !data.sessionToken) {
        throw new Error(data.error || "session_failed");
      }
      setSessionId(data.sessionId);
      setSessionToken(data.sessionToken);
      window.localStorage.setItem(sessionKey, JSON.stringify({ sessionId: data.sessionId, sessionToken: data.sessionToken }));
      return { sessionId: data.sessionId, sessionToken: data.sessionToken };
    } catch (err) {
      const message = err instanceof Error ? err.message : "session_failed";
      setError(normalizeError(message));
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage() {
    const message = input.trim();
    if (!message || loading) return;
    const session = await ensureSession();
    if (!session) return;
    setLoading(true);
    setError("");
    setInput("");
    try {
      const res = await fetch("/api/livechat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.sessionId, sessionToken: session.sessionToken, message })
      });
      const data = (await res.json()) as { message?: ChatMessage; error?: string };
      if (!res.ok) throw new Error(data.error || "send_failed");
      if (data.message) setMessages((prev) => [...prev, data.message as ChatMessage]);
    } catch (err) {
      const messageText = err instanceof Error ? err.message : "send_failed";
      setError(normalizeError(messageText));
      setInput(message);
    } finally {
      setLoading(false);
    }
  }

  async function onOpenClick() {
    setOpen((v) => !v);
    if (!open) await ensureSession();
  }

  function formatTime(iso: string) {
    try {
      return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* ── Chat Panel ──────────────────────────────────── */}
      {open && (
        <div className="mb-3 w-[340px] max-w-[calc(100vw-2.5rem)] rounded-2xl border border-white/[0.08] bg-panel shadow-2xl shadow-black/60 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-panel flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <p className="text-sm font-semibold text-text">Live Support</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md p-1 hover:bg-white/[0.06] transition-colors text-subtle/60 hover:text-subtle"
              aria-label="Close chat"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Welcome banner */}
          <div className="mx-3 mt-3 rounded-xl border border-accent/20 bg-accent/[0.07] px-3 py-2.5 text-[11px] leading-relaxed text-subtle flex-shrink-0">
            Pulseframelabs Support — Erreichbar Mo–Fr, 08:00–19:00 Uhr. Wir antworten innerhalb weniger Minuten.
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 min-h-[180px] max-h-[260px]">
            {messages.length === 0 ? (
              <p className="text-xs text-subtle/50 text-center pt-4">
                Schreib uns — Antworten erscheinen hier live.
              </p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col gap-0.5 ${msg.sender === "viewer" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                      msg.sender === "viewer"
                        ? "bg-accent/15 border border-accent/25 text-text rounded-br-sm"
                        : msg.sender === "agent"
                        ? "bg-white/[0.07] border border-white/[0.08] text-text rounded-bl-sm"
                        : "bg-white/[0.04] border border-white/[0.06] text-subtle/70 text-center mx-auto"
                    }`}
                  >
                    {msg.body}
                  </div>
                  <span className="text-[10px] text-subtle/30 px-1">
                    {msg.sender === "viewer" ? "Du" : msg.sender === "agent" ? "Support" : "System"} · {formatTime(msg.created_at)}
                  </span>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 pb-3 pt-2 border-t border-white/[0.05] flex-shrink-0">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) void sendMessage();
                }}
                maxLength={1000}
                placeholder="Nachricht eingeben…"
                className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-text placeholder:text-subtle/40 outline-none focus:border-accent/40 transition-colors"
              />
              <button
                type="button"
                onClick={() => void sendMessage()}
                disabled={loading || !input.trim()}
                className="rounded-xl bg-accent px-3 py-2 text-xs font-semibold text-black disabled:opacity-40 hover:bg-accent/90 transition-colors flex-shrink-0"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className={loading ? "opacity-50" : ""}>
                  <path d="M14 8L2 2l2 6-2 6 12-6z" fill="currentColor" />
                </svg>
              </button>
            </div>
            {error && <p className="mt-1.5 text-[10px] text-danger/80">{error}</p>}
          </div>
        </div>
      )}

      {/* ── Toggle Button ──────────────────────────────── */}
      <button
        type="button"
        onClick={() => void onOpenClick()}
        className={`grid h-12 w-12 place-items-center rounded-full border shadow-lg transition-all duration-200 ${
          open
            ? "border-white/10 bg-panel text-subtle hover:text-text"
            : "border-accent/30 bg-accent text-black hover:bg-accent/90 shadow-accent/20"
        }`}
        aria-label={open ? "Close support chat" : "Open live support chat"}
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M7 8H17M7 12H14M5 20L8.2 16.8H18C19.1 16.8 20 15.9 20 14.8V6C20 4.9 19.1 4 18 4H6C4.9 4 4 4.9 4 6V18.6C4 19.8 5.4 20.4 6.3 19.6L5 20Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    </div>
  );
}
