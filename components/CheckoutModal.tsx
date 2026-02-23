"use client";

import { useEffect, useRef, useState } from "react";

type Plan = "pro" | "enterprise";
type Coin = "btc" | "eth" | "trc20/usdt" | "ltc";

type PaymentSession = {
  paymentId: string;
  addressIn: string;
  coinAmount: number;
  coinLabel: string;
  amountEur: number;
  plan: Plan;
  coin: Coin;
  expiresAt: string;
};

const COIN_META: Record<Coin, { label: string; symbol: string; note?: string }> = {
  btc:          { label: "Bitcoin",       symbol: "BTC" },
  eth:          { label: "Ethereum",      symbol: "ETH" },
  "trc20/usdt": { label: "USDT (TRC20)",  symbol: "USDT", note: "Low fees ~$0.01" },
  ltc:          { label: "Litecoin",      symbol: "LTC",  note: "Fast & cheap" },
};

const PLAN_LABELS: Record<Plan, string> = { pro: "Pro", enterprise: "Enterprise" };
const PLAN_PRICES: Record<Plan, number> = { pro: 150, enterprise: 300 };

function toFiniteNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function useCountdown(expiresAt: string | null) {
  const [remaining, setRemaining] = useState<number>(0);
  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => setRemaining(Math.max(0, new Date(expiresAt).getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  const h = Math.floor(remaining / 3_600_000);
  const m = Math.floor((remaining % 3_600_000) / 60_000);
  const s = Math.floor((remaining % 60_000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1.5 rounded-lg bg-accent/10 border border-accent/25 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/20 transition-colors flex-shrink-0"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export function CheckoutModal({ plan, onClose }: { plan: Plan; onClose: () => void }) {
  const [step, setStep] = useState<"coin" | "awaiting" | "confirmed">("coin");
  const [selectedCoin, setSelectedCoin] = useState<Coin>("ltc");
  const [session, setSession] = useState<PaymentSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdown = useCountdown(session?.expiresAt ?? null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Polling for payment confirmation
  useEffect(() => {
    if (step !== "awaiting" || !session) return;
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/payments/${session.paymentId}`);
        if (!res.ok) return;
        const data = await res.json() as { status: string };
        if (data.status === "confirmed") {
          clearInterval(pollRef.current!);
          setStep("confirmed");
        }
      } catch { /* ignore */ }
    }, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [step, session]);

  async function startPayment() {
    setLoading(true);
    setError(null);
    setQrError(false);
    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan, coin: selectedCoin }),
      });
      const data = await res.json();
      if (!res.ok) {
        const errCode = (data as { error?: string }).error ?? "";
        if (errCode === "wallet_not_configured") {
          setError("This payment method is not yet configured. Please try a different coin.");
        } else {
          setError(errCode || "Failed to create payment session");
        }
        return;
      }
      const coinAmount = toFiniteNumber((data as { coinAmount?: unknown }).coinAmount);
      if (coinAmount === null) {
        setError("Invalid payment amount returned by server.");
        return;
      }
      const normalized: PaymentSession = {
        paymentId: String((data as { paymentId?: unknown }).paymentId ?? ""),
        addressIn: String((data as { addressIn?: unknown }).addressIn ?? ""),
        coinAmount,
        coinLabel: String((data as { coinLabel?: unknown }).coinLabel ?? ""),
        amountEur: toFiniteNumber((data as { amountEur?: unknown }).amountEur) ?? PLAN_PRICES[plan],
        plan,
        coin: selectedCoin,
        expiresAt: String((data as { expiresAt?: unknown }).expiresAt ?? "")
      };
      setSession(normalized);
      setStep("awaiting");
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  const [qrError, setQrError] = useState(false);
  const coinAmountStr = session ? Number(session.coinAmount).toFixed(8).replace(/\.?0+$/, "") : "";
  const qrUrl = session
    ? `https://api.cryptapi.io/${session.coin}/qrcode/?address=${encodeURIComponent(session.addressIn)}&value=${coinAmountStr}&size=200`
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-md rounded-2xl border border-panelMuted bg-panel shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-panelMuted">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-accent">Checkout</p>
            <h2 className="text-lg font-black text-text">
              {PLAN_LABELS[plan]} — {PLAN_PRICES[plan]}€/month
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-panelMuted transition-colors text-subtle"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="p-5">
          {/* ── STEP 1: Coin selection ── */}
          {step === "coin" && (
            <div className="space-y-4">
              <p className="text-sm text-subtle">Choose a cryptocurrency to pay with:</p>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(COIN_META) as [Coin, typeof COIN_META[Coin]][]).map(([coin, meta]) => (
                  <button
                    key={coin}
                    type="button"
                    onClick={() => setSelectedCoin(coin)}
                    className={`rounded-xl border p-3 text-left transition-colors ${
                      selectedCoin === coin
                        ? "border-accent/60 bg-accent/10"
                        : "border-panelMuted bg-panelMuted/30 hover:border-panelMuted/80"
                    }`}
                  >
                    <p className="font-bold text-sm text-text">{meta.label}</p>
                    <p className="text-xs text-subtle">{meta.symbol}</p>
                    {meta.note && (
                      <p className="text-[10px] text-accent mt-1">{meta.note}</p>
                    )}
                  </button>
                ))}
              </div>
              {error && <p className="text-xs text-danger">{error}</p>}
              <button
                type="button"
                disabled={loading}
                onClick={startPayment}
                className="w-full rounded-xl py-3 font-black text-black disabled:opacity-60 transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #f5c451, #e8a020)" }}
              >
                {loading ? "Generating address…" : `Pay with ${COIN_META[selectedCoin].symbol}`}
              </button>
            </div>
          )}

          {/* ── STEP 2: Awaiting payment ── */}
          {step === "awaiting" && session && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-text">Send exactly:</p>
                <span className="rounded-full bg-accent/10 border border-accent/25 px-2.5 py-1 text-xs font-bold text-accent font-mono">
                  {(toFiniteNumber(session.coinAmount) ?? 0).toFixed(8).replace(/\.?0+$/, "")} {session.coinLabel}
                </span>
              </div>

              {/* QR Code */}
              {qrUrl && (
                <div className="flex justify-center">
                  {qrError ? (
                    <div className="flex items-center justify-center w-[160px] h-[160px] rounded-lg border border-panelMuted bg-panelMuted/30 text-center px-3">
                      <p className="text-[10px] text-subtle/60">QR not available — use the address above</p>
                    </div>
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={qrUrl}
                      alt="Payment QR code"
                      width={160}
                      height={160}
                      className="rounded-lg border border-panelMuted bg-white p-1"
                      onError={() => setQrError(true)}
                    />
                  )}
                </div>
              )}

              {/* Address */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-subtle">Send to this address:</p>
                <div className="flex items-center gap-2 rounded-lg border border-panelMuted bg-panelMuted/40 p-2.5">
                  <p className="font-mono text-xs text-text/80 break-all flex-1 select-all">{session.addressIn}</p>
                  <CopyButton text={session.addressIn} />
                </div>
              </div>

              {/* Countdown + status */}
              <div className="flex items-center justify-between text-xs text-subtle">
                <span>Expires in: <span className="font-mono text-text">{countdown}</span></span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                  Waiting for payment…
                </span>
              </div>

              <p className="text-[10px] text-subtle/60 text-center">
                We&apos;ll detect your payment automatically. This page polls every 5 seconds.
                Do not close this window until confirmed.
              </p>
            </div>
          )}

          {/* ── STEP 3: Confirmed ── */}
          {step === "confirmed" && (
            <div className="space-y-4 text-center py-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 mx-auto">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M6 16l7 7 13-13" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-black text-text">Payment Confirmed!</h3>
                <p className="text-sm text-subtle mt-1">
                  Your <span className="text-accent font-semibold">{PLAN_LABELS[plan]}</span> subscription is now active for 30 days.
                </p>
              </div>
              <a
                href="/home"
                className="block w-full rounded-xl py-3 font-black text-black transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #f5c451, #e8a020)" }}
              >
                Go to Dashboard
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
