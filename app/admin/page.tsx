"use client";

import { useEffect, useState, useCallback } from "react";
import type { WebsiteDeal, WebsiteConfig } from "@/lib/website-config";

// ── Types ─────────────────────────────────────────────────────────────────────

type AdminUser = {
  id: string;
  email: string;
  createdAt: string;
  twitchLogin: string | null;
  twitchDisplayName: string | null;
  channelId: string | null;
  channelSlug: string | null;
  plan: string;
  subscriptionExpiresAt: string | null;
  overlayCount: number;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function PlanBadge({ plan }: { plan: string }) {
  const styles: Record<string, string> = {
    enterprise: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    pro: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    starter: "bg-white/[0.06] text-[#64748b] border-white/[0.08]"
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${styles[plan] ?? styles.starter}`}>
      {plan}
    </span>
  );
}

function fmt(iso: string) {
  try { return new Date(iso).toLocaleDateString("de-DE"); } catch { return "—"; }
}

// ── Deal editor ────────────────────────────────────────────────────────────────

const EMPTY_DEAL: WebsiteDeal = { casinoName: "", casinoUrl: "", wager: "", bonusCode: "", actionAfterSignup: "" };

function DealEditor({ userId, email, onClose }: { userId: string; email: string; onClose: () => void }) {
  const [config, setConfig] = useState<WebsiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/users/${userId}/deals`)
      .then((r) => r.json())
      .then((d) => { setConfig(d.config); setLoading(false); })
      .catch(() => { setError("Failed to load config"); setLoading(false); });
  }, [userId]);

  function updateDeal(i: number, key: keyof WebsiteDeal, val: string) {
    setConfig((prev) => {
      if (!prev) return prev;
      const next = [...prev.deals];
      next[i] = { ...next[i], [key]: val };
      return { ...prev, deals: next };
    });
  }

  function addDeal() {
    setConfig((prev) => prev ? { ...prev, deals: [...prev.deals, { ...EMPTY_DEAL }] } : prev);
  }

  function removeDeal(i: number) {
    setConfig((prev) => prev ? { ...prev, deals: prev.deals.filter((_, idx) => idx !== i) } : prev);
  }

  async function save() {
    if (!config) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}/deals`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ config })
      });
      if (!res.ok) throw new Error("Save failed");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 bg-black/70 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-2xl rounded-2xl border border-white/[0.08] bg-[#0d1220] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] flex-shrink-0">
          <div>
            <p className="text-sm font-bold text-[#e2e8f0]">Casino Deals</p>
            <p className="text-xs text-[#64748b] mt-0.5 truncate max-w-xs">{email}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-[#64748b] hover:text-[#e2e8f0] transition-colors">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {loading && <p className="text-sm text-[#64748b] text-center py-8">Loading...</p>}
          {error && <p className="text-sm text-rose-400 bg-rose-500/10 rounded-lg px-3 py-2">{error}</p>}

          {!loading && config && (
            <>
              {config.deals.length === 0 && (
                <p className="text-xs text-[#64748b] text-center py-4 rounded-lg border border-dashed border-white/[0.08]">No deals yet — add one below.</p>
              )}

              {config.deals.map((deal, i) => (
                <div key={i} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold text-[#94a3b8]">Deal {i + 1}</p>
                    <button onClick={() => removeDeal(i)} className="text-[10px] text-rose-400/60 hover:text-rose-400 transition-colors px-1.5 py-0.5 rounded hover:bg-rose-500/10">Remove</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {([
                      ["casinoName", "Casino Name"],
                      ["casinoUrl", "Casino URL"],
                      ["wager", "Wager"],
                      ["bonusCode", "Bonus Code"],
                    ] as [keyof WebsiteDeal, string][]).map(([k, label]) => (
                      <label key={k} className="block">
                        <p className="text-[10px] text-[#64748b] mb-1">{label}</p>
                        <input
                          value={deal[k]}
                          onChange={(e) => updateDeal(i, k, e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-sm text-[#e2e8f0] focus:outline-none focus:border-rose-500/40 focus:bg-white/[0.06] transition-colors"
                          placeholder={label}
                        />
                      </label>
                    ))}
                  </div>
                  <label className="block">
                    <p className="text-[10px] text-[#64748b] mb-1">Action after signup</p>
                    <input
                      value={deal.actionAfterSignup}
                      onChange={(e) => updateDeal(i, "actionAfterSignup", e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-sm text-[#e2e8f0] focus:outline-none focus:border-rose-500/40 focus:bg-white/[0.06] transition-colors"
                      placeholder="e.g. Contact support for bonus"
                    />
                  </label>
                </div>
              ))}

              <button
                onClick={addDeal}
                className="w-full py-2.5 rounded-xl border border-dashed border-white/[0.1] text-xs font-semibold text-[#64748b] hover:text-[#e2e8f0] hover:border-white/[0.2] hover:bg-white/[0.02] transition-all"
              >
                + Add Deal
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        {!loading && config && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06] flex-shrink-0">
            {saved ? (
              <span className="text-xs text-emerald-400 font-medium">Saved</span>
            ) : error ? (
              <span className="text-xs text-rose-400">{error}</span>
            ) : (
              <span className="text-xs text-[#64748b]">{config.deals.length} deal{config.deals.length !== 1 ? "s" : ""}</span>
            )}
            <button
              onClick={save}
              disabled={saving}
              className="px-4 py-1.5 rounded-lg bg-rose-500/80 hover:bg-rose-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Deals"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Plan modal ────────────────────────────────────────────────────────────────

const PLAN_OPTIONS = [
  { value: "starter", label: "Starter (Free)" },
  { value: "pro", label: "Pro (150€/mo)" },
  { value: "enterprise", label: "Enterprise (300€/mo)" }
];

function PlanModal({ user, onClose, onUpdated }: { user: AdminUser; onClose: () => void; onUpdated: (userId: string, plan: string, expiresAt: string | null) => void }) {
  const [plan, setPlan] = useState(user.plan);
  const [days, setDays] = useState("30");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/plan`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan, durationDays: Number(days) || 30 })
      });
      if (!res.ok) throw new Error("Failed to update plan");
      const data = await res.json();
      onUpdated(user.id, plan, data.expiresAt ?? null);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#0d1220] shadow-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-[#e2e8f0]">Change Plan</p>
          <button onClick={onClose} className="w-6 h-6 rounded-md bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-[#64748b] hover:text-[#e2e8f0] transition-colors">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
          </button>
        </div>

        <p className="text-xs text-[#64748b] truncate">{user.email}</p>

        <div className="space-y-2">
          {PLAN_OPTIONS.map((opt) => (
            <label key={opt.value} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${plan === opt.value ? "border-rose-500/40 bg-rose-500/10" : "border-white/[0.07] hover:border-white/[0.12]"}`}>
              <input type="radio" name="plan" value={opt.value} checked={plan === opt.value} onChange={() => setPlan(opt.value)} className="accent-rose-500" />
              <span className="text-sm text-[#e2e8f0]">{opt.label}</span>
            </label>
          ))}
        </div>

        {plan !== "starter" && (
          <label className="block">
            <p className="text-[10px] text-[#64748b] mb-1.5">Duration (days)</p>
            <input
              type="number"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              min="1"
              className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.07] text-sm text-[#e2e8f0] focus:outline-none focus:border-rose-500/40 transition-colors"
            />
          </label>
        )}

        {error && <p className="text-xs text-rose-400">{error}</p>}

        <button
          onClick={save}
          disabled={saving}
          className="w-full py-2.5 rounded-xl bg-rose-500/80 hover:bg-rose-500 text-white text-sm font-semibold transition-colors disabled:opacity-50"
        >
          {saving ? "Updating..." : "Update Plan"}
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dealUser, setDealUser] = useState<AdminUser | null>(null);
  const [planUser, setPlanUser] = useState<AdminUser | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => { setUsers(d.users ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  function handlePlanUpdated(userId: string, plan: string, expiresAt: string | null) {
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, plan, subscriptionExpiresAt: expiresAt } : u));
  }

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      (u.twitchLogin ?? "").toLowerCase().includes(q) ||
      (u.channelSlug ?? "").toLowerCase().includes(q)
    );
  });

  const stats = {
    total: users.length,
    pro: users.filter((u) => u.plan === "pro").length,
    enterprise: users.filter((u) => u.plan === "enterprise").length,
    withTwitch: users.filter((u) => u.twitchLogin).length
  };

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Users", value: stats.total, color: "text-[#e2e8f0]" },
          { label: "Pro", value: stats.pro, color: "text-amber-300" },
          { label: "Enterprise", value: stats.enterprise, color: "text-purple-300" },
          { label: "Twitch Connected", value: stats.withTwitch, color: "text-[#38bdf8]" }
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-white/[0.06] bg-[#0d1220] p-4">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#475569]">{s.label}</p>
            <p className={`mt-2 text-2xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div className="rounded-xl border border-white/[0.06] bg-[#0d1220] overflow-hidden">
        {/* Table header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
          <h2 className="text-sm font-bold text-[#e2e8f0]">Users</h2>
          <div className="flex items-center gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search email, Twitch, slug…"
              className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-xs text-[#e2e8f0] placeholder:text-[#475569] focus:outline-none focus:border-rose-500/40 w-56 transition-colors"
            />
            <button onClick={load} className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-xs text-[#64748b] hover:text-[#e2e8f0] hover:bg-white/[0.07] transition-colors">
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="px-5 py-12 text-center text-sm text-[#475569] animate-pulse">Loading users…</div>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-[#475569]">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.14em] text-[#475569] border-b border-white/[0.05]">
                  <th className="text-left px-5 py-2.5 font-medium">Email</th>
                  <th className="text-left px-4 py-2.5 font-medium">Twitch</th>
                  <th className="text-left px-4 py-2.5 font-medium">Plan</th>
                  <th className="text-left px-4 py-2.5 font-medium">Expires</th>
                  <th className="text-left px-4 py-2.5 font-medium">Overlays</th>
                  <th className="text-left px-4 py-2.5 font-medium">Channel</th>
                  <th className="text-left px-4 py-2.5 font-medium">Joined</th>
                  <th className="text-right px-5 py-2.5 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.015] transition-colors">
                    <td className="px-5 py-3 font-medium text-[#e2e8f0] max-w-[200px] truncate">{user.email}</td>
                    <td className="px-4 py-3 text-[#64748b]">
                      {user.twitchLogin ? (
                        <span className="text-[#38bdf8]">{user.twitchDisplayName ?? user.twitchLogin}</span>
                      ) : (
                        <span className="text-[#334155]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <PlanBadge plan={user.plan} />
                    </td>
                    <td className="px-4 py-3 text-[#64748b] text-xs">
                      {user.subscriptionExpiresAt && user.plan !== "starter"
                        ? fmt(user.subscriptionExpiresAt)
                        : <span className="text-[#334155]">—</span>}
                    </td>
                    <td className="px-4 py-3 text-[#64748b]">{user.overlayCount}</td>
                    <td className="px-4 py-3 text-[#64748b] font-mono text-xs">
                      {user.channelSlug ?? <span className="text-[#334155]">—</span>}
                    </td>
                    <td className="px-4 py-3 text-[#64748b] text-xs">{fmt(user.createdAt)}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {user.channelId && (
                          <button
                            onClick={() => setDealUser(user)}
                            className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.07] text-[11px] font-medium text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-white/[0.08] transition-colors"
                          >
                            Deals
                          </button>
                        )}
                        <button
                          onClick={() => setPlanUser(user)}
                          className="px-2.5 py-1 rounded-md bg-rose-500/10 border border-rose-500/20 text-[11px] font-medium text-rose-400 hover:bg-rose-500/20 transition-colors"
                        >
                          Plan
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && (
          <div className="px-5 py-2.5 border-t border-white/[0.05]">
            <p className="text-[11px] text-[#334155]">{filtered.length} of {users.length} users</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {dealUser && (
        <DealEditor
          userId={dealUser.id}
          email={dealUser.email}
          onClose={() => setDealUser(null)}
        />
      )}
      {planUser && (
        <PlanModal
          user={planUser}
          onClose={() => setPlanUser(null)}
          onUpdated={handlePlanUpdated}
        />
      )}
    </>
  );
}
