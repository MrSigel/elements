"use client";

import { useEffect, useMemo, useState } from "react";

type ChatMessage = {
  id: string;
  sender: "viewer" | "agent" | "system";
  body: string;
  created_at: string;
};

const SESSION_KEY_PREFIX = "livechat:";

export function PublicHelpWidget({ channelSlug }: { channelSlug: string }) {
  const sessionStorageKey = useMemo(() => `${SESSION_KEY_PREFIX}${channelSlug}`, [channelSlug]);
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [sessionToken, setSessionToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const raw = window.localStorage.getItem(sessionStorageKey);
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
  }, [sessionStorageKey]);

  useEffect(() => {
    if (!sessionId || !sessionToken) return;
    const run = async () => {
      const url = `/api/livechat/messages?sessionId=${encodeURIComponent(sessionId)}&sessionToken=${encodeURIComponent(sessionToken)}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { messages?: ChatMessage[] };
      setMessages(data.messages ?? []);
    };
    void run();
    const timer = window.setInterval(() => void run(), 3000);
    return () => window.clearInterval(timer);
  }, [sessionId, sessionToken]);

  async function ensureSession() {
    if (sessionId && sessionToken) return { sessionId, sessionToken };
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/livechat/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelSlug })
      });
      if (!res.ok) throw new Error("session_failed");
      const data = (await res.json()) as { sessionId: string; sessionToken: string };
      setSessionId(data.sessionId);
      setSessionToken(data.sessionToken);
      window.localStorage.setItem(sessionStorageKey, JSON.stringify(data));
      return { sessionId: data.sessionId, sessionToken: data.sessionToken };
    } catch {
      setError("Support chat is currently unavailable.");
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
      if (!res.ok) throw new Error("send_failed");
      const data = (await res.json()) as { message?: ChatMessage };
      if (data.message) {
        setMessages((prev) => [...prev, data.message as ChatMessage]);
      }
    } catch {
      setError("Message could not be sent.");
      setInput(message);
    } finally {
      setLoading(false);
    }
  }

  async function onOpenClick() {
    setOpen((v) => !v);
    if (!open) {
      await ensureSession();
    }
  }

  return (
    <div className="fixed bottom-4 left-4 z-40">
      {open ? (
        <div className="mb-2 w-[340px] max-w-[calc(100vw-2rem)] rounded-xl border border-[#2a3142] bg-[#0d1320] p-3 text-xs text-slate-200 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-semibold text-white">Live Support</p>
            <span className="text-[10px] text-slate-400">Discord connected</span>
          </div>

          <div className="mb-2 h-56 overflow-y-auto rounded-md border border-[#1e2535] bg-[#0a0f18] p-2">
            {messages.length === 0 ? (
              <p className="text-slate-400">Write a message. We answer in this window.</p>
            ) : (
              <div className="space-y-1.5">
                {messages.map((msg) => (
                  <div key={msg.id} className="text-[11px]">
                    <span
                      className={
                        msg.sender === "viewer"
                          ? "text-cyan-300"
                          : msg.sender === "agent"
                            ? "text-emerald-300"
                            : "text-slate-300"
                      }
                    >
                      {msg.sender === "viewer" ? "You" : msg.sender === "agent" ? "Support" : "System"}:
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
              placeholder="Type your message..."
              className="h-9 flex-1 rounded-md border border-[#2a3142] bg-[#111827] px-2 text-xs text-white outline-none focus:border-cyan-400"
            />
            <button
              type="button"
              onClick={() => void sendMessage()}
              disabled={loading || !input.trim()}
              className="h-9 rounded-md bg-cyan-600 px-3 text-xs font-semibold text-white disabled:opacity-50"
            >
              Send
            </button>
          </div>

          {error ? <p className="mt-2 text-[11px] text-rose-300">{error}</p> : null}
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => void onOpenClick()}
        className="grid h-11 w-11 place-items-center rounded-full border border-[#2a3142] bg-[#111827] text-white shadow-lg"
        aria-label="Open live support chat"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M7 8H17M7 12H14M5 20L8.2 16.8H18C19.1 16.8 20 15.9 20 14.8V6C20 4.9 19.1 4 18 4H6C4.9 4 4 4.9 4 6V18.6C4 19.8 5.4 20.4 6.3 19.6L5 20Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
