"use client";

import { useEffect, useState } from "react";

type ChatMessage = {
  id: string;
  sender: "viewer" | "agent" | "system";
  body: string;
  created_at: string;
};

const SESSION_KEY = "dashboard-livechat-session";

export function DashboardLiveChatWidget() {
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [sessionToken, setSessionToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  function normalizeError(raw: string) {
    if (raw.startsWith("discord_rate_limited")) return "Discord ist kurz rate-limited. Bitte in 10-30 Sekunden erneut senden.";
    if (raw.startsWith("discord_api_")) return "Discord API Fehler. Bitte Bot-Rechte und Kanal-ID prüfen.";
    if (raw === "discord_not_configured") return "Discord ist noch nicht konfiguriert (Token/Kanal-ID fehlt).";
    return raw;
  }

  useEffect(() => {
    const raw = window.localStorage.getItem(SESSION_KEY);
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
  }, []);

  useEffect(() => {
    if (!sessionId || !sessionToken) return;
    const run = async (syncDiscord = false) => {
      const url = `/api/livechat/messages?sessionId=${encodeURIComponent(sessionId)}&sessionToken=${encodeURIComponent(sessionToken)}${syncDiscord ? "&sync=1" : ""}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { messages?: ChatMessage[] };
      setMessages(data.messages ?? []);
    };
    void run(true);
    const dbTimer = window.setInterval(() => void run(false), 2500);
    const discordSyncTimer = window.setInterval(() => void run(true), 20000);
    return () => {
      window.clearInterval(dbTimer);
      window.clearInterval(discordSyncTimer);
    };
  }, [sessionId, sessionToken]);

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
      window.localStorage.setItem(SESSION_KEY, JSON.stringify({ sessionId: data.sessionId, sessionToken: data.sessionToken }));
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

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        <div className="mb-2 w-[340px] max-w-[calc(100vw-2rem)] rounded-xl border border-[#2a3142] bg-[#0d1320] p-3 text-xs text-slate-200 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-semibold text-white">Live Support</p>
            <span className="text-[10px] text-slate-400">Discord bridge</span>
          </div>
          <div className="mb-2 h-56 overflow-y-auto rounded-md border border-[#1e2535] bg-[#0a0f18] p-2">
            {messages.length === 0 ? (
              <p className="text-slate-400">Schreib uns direkt hier. Antworten kommen live rein.</p>
            ) : (
              <div className="space-y-1.5">
                {messages.map((msg) => (
                  <div key={msg.id} className="text-[11px]">
                    <span className={msg.sender === "viewer" ? "text-cyan-300" : msg.sender === "agent" ? "text-emerald-300" : "text-slate-300"}>
                      {msg.sender === "viewer" ? "Du" : msg.sender === "agent" ? "Support" : "System"}:
                    </span>{" "}
                    <span className="text-slate-100">{msg.body}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void sendMessage();
              }}
              maxLength={1000}
              placeholder="Nachricht eingeben..."
              className="h-9 flex-1 rounded-md border border-[#2a3142] bg-[#111827] px-2 text-xs text-white outline-none focus:border-emerald-400"
            />
            <button
              type="button"
              onClick={() => void sendMessage()}
              disabled={loading || !input.trim()}
              className="h-9 rounded-md bg-emerald-600 px-3 text-xs font-semibold text-white disabled:opacity-50"
            >
              Senden
            </button>
          </div>
          {error ? <p className="mt-2 text-[11px] text-rose-300">{error}</p> : null}
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => void onOpenClick()}
        className="grid h-12 w-12 place-items-center rounded-full border border-emerald-300/50 bg-emerald-600 text-white shadow-lg shadow-emerald-900/40 hover:bg-emerald-500 transition-colors"
        aria-label="Open live support chat"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M7 8H17M7 12H14M5 20L8.2 16.8H18C19.1 16.8 20 15.9 20 14.8V6C20 4.9 19.1 4 18 4H6C4.9 4 4 4.9 4 6V18.6C4 19.8 5.4 20.4 6.3 19.6L5 20Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
