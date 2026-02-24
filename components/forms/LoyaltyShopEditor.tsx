"use client";

import { useEffect, useState } from "react";

type LoyaltyItem = {
  id: string;
  name: string;
  cost: number;
  cooldown_secs: number;
};

export function LoyaltyShopEditor() {
  const [items, setItems] = useState<LoyaltyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // New item form
  const [newName, setNewName] = useState("");
  const [newCost, setNewCost] = useState("100");
  const [newCooldown, setNewCooldown] = useState("0");
  const [adding, setAdding] = useState(false);

  // Inline edit state: itemId → draft values
  const [editing, setEditing] = useState<Record<string, { name: string; cost: string; cooldown: string }>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});

  async function loadItems() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/loyalty/items");
      if (!res.ok) throw new Error("Failed to load items");
      const data = await res.json() as { items: LoyaltyItem[] };
      setItems(data.items ?? []);
    } catch {
      setError("Could not load loyalty items.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadItems(); }, []);

  async function addItem() {
    const name = newName.trim();
    if (!name) return;
    setAdding(true);
    setError("");
    try {
      const res = await fetch("/api/loyalty/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, cost: Number(newCost) || 100, cooldown_secs: Number(newCooldown) || 0 })
      });
      if (!res.ok) throw new Error("Failed to add item");
      const data = await res.json() as { item: LoyaltyItem };
      setItems((prev) => [...prev, data.item]);
      setNewName("");
      setNewCost("100");
      setNewCooldown("0");
    } catch {
      setError("Could not add item.");
    } finally {
      setAdding(false);
    }
  }

  function startEdit(item: LoyaltyItem) {
    setEditing((prev) => ({
      ...prev,
      [item.id]: { name: item.name, cost: String(item.cost), cooldown: String(item.cooldown_secs) }
    }));
  }

  function cancelEdit(id: string) {
    setEditing((prev) => { const n = { ...prev }; delete n[id]; return n; });
  }

  async function saveEdit(id: string) {
    const draft = editing[id];
    if (!draft) return;
    const name = draft.name.trim();
    if (!name) return;
    setSaving((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/loyalty/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, cost: Number(draft.cost) || 100, cooldown_secs: Number(draft.cooldown) || 0 })
      });
      if (!res.ok) throw new Error("save failed");
      setItems((prev) => prev.map((it) => it.id === id ? { ...it, name, cost: Number(draft.cost) || 100, cooldown_secs: Number(draft.cooldown) || 0 } : it));
      cancelEdit(id);
    } catch {
      setError("Could not save changes.");
    } finally {
      setSaving((prev) => ({ ...prev, [id]: false }));
    }
  }

  async function deleteItem(id: string) {
    setDeleting((prev) => ({ ...prev, [id]: true }));
    try {
      await fetch(`/api/loyalty/items/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((it) => it.id !== id));
    } catch {
      setError("Could not delete item.");
    } finally {
      setDeleting((prev) => ({ ...prev, [id]: false }));
    }
  }

  return (
    <div className="rounded-lg border border-panelMuted bg-panelMuted/30 p-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-subtle uppercase tracking-wide">Loyalty Shop Items</p>
        <p className="text-[10px] text-subtle/50">Viewers redeem with <code className="bg-panelMuted px-1 rounded">!redeem [name]</code></p>
      </div>

      {error && <p className="text-xs text-danger/80 bg-danger/10 rounded px-2 py-1">{error}</p>}

      {/* Items list */}
      {loading ? (
        <p className="text-xs text-subtle/50">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-xs text-subtle/50 italic">No items yet — add one below.</p>
      ) : (
        <div className="space-y-1.5">
          {items.map((item) => {
            const draft = editing[item.id];
            return (
              <div key={item.id} className="rounded-md border border-white/[0.06] bg-panel/50 px-3 py-2 flex items-center gap-2">
                {draft ? (
                  <>
                    <input
                      value={draft.name}
                      onChange={(e) => setEditing((prev) => ({ ...prev, [item.id]: { ...prev[item.id], name: e.target.value } }))}
                      className="flex-1 rounded bg-panelMuted px-2 py-1 text-xs text-text border border-white/[0.06] focus:outline-none focus:border-accent/40"
                      placeholder="Item name"
                    />
                    <input
                      type="number"
                      value={draft.cost}
                      min={1}
                      onChange={(e) => setEditing((prev) => ({ ...prev, [item.id]: { ...prev[item.id], cost: e.target.value } }))}
                      className="w-20 rounded bg-panelMuted px-2 py-1 text-xs text-text border border-white/[0.06] focus:outline-none focus:border-accent/40"
                      placeholder="Cost"
                    />
                    <input
                      type="number"
                      value={draft.cooldown}
                      min={0}
                      onChange={(e) => setEditing((prev) => ({ ...prev, [item.id]: { ...prev[item.id], cooldown: e.target.value } }))}
                      className="w-20 rounded bg-panelMuted px-2 py-1 text-xs text-text border border-white/[0.06] focus:outline-none focus:border-accent/40"
                      placeholder="Cooldown (s)"
                    />
                    <button
                      type="button"
                      onClick={() => void saveEdit(item.id)}
                      disabled={saving[item.id]}
                      className="rounded bg-accent px-2 py-1 text-xs font-semibold text-black disabled:opacity-50"
                    >
                      {saving[item.id] ? "…" : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => cancelEdit(item.id)}
                      className="rounded bg-panelMuted px-2 py-1 text-xs text-subtle hover:text-text"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-xs text-text font-medium truncate">{item.name}</span>
                    <span className="text-[10px] text-accent font-semibold whitespace-nowrap">{item.cost} pts</span>
                    {item.cooldown_secs > 0 && (
                      <span className="text-[10px] text-subtle/60 whitespace-nowrap">{item.cooldown_secs}s cd</span>
                    )}
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      className="rounded bg-panelMuted px-2 py-1 text-[10px] text-subtle hover:text-text transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteItem(item.id)}
                      disabled={deleting[item.id]}
                      className="rounded bg-danger/10 px-2 py-1 text-[10px] text-danger hover:bg-danger/20 disabled:opacity-50 transition-colors"
                    >
                      {deleting[item.id] ? "…" : "Delete"}
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add item form */}
      <div className="pt-1 border-t border-white/[0.05]">
        <p className="text-[10px] text-subtle/50 mb-2 uppercase tracking-wide">Add Item</p>
        <div className="flex gap-1.5 flex-wrap">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") void addItem(); }}
            placeholder="Item name (e.g. Shoutout)"
            className="flex-1 min-w-[120px] rounded bg-panelMuted px-2 py-1.5 text-xs text-text border border-white/[0.06] focus:outline-none focus:border-accent/40 placeholder:text-subtle/40"
          />
          <input
            type="number"
            value={newCost}
            min={1}
            onChange={(e) => setNewCost(e.target.value)}
            className="w-20 rounded bg-panelMuted px-2 py-1.5 text-xs text-text border border-white/[0.06] focus:outline-none focus:border-accent/40"
            title="Cost in points"
            placeholder="Cost"
          />
          <input
            type="number"
            value={newCooldown}
            min={0}
            onChange={(e) => setNewCooldown(e.target.value)}
            className="w-24 rounded bg-panelMuted px-2 py-1.5 text-xs text-text border border-white/[0.06] focus:outline-none focus:border-accent/40"
            title="Cooldown in seconds (0 = no cooldown)"
            placeholder="Cooldown (s)"
          />
          <button
            type="button"
            onClick={() => void addItem()}
            disabled={adding || !newName.trim()}
            className="rounded bg-accent px-3 py-1.5 text-xs font-semibold text-black disabled:opacity-50 hover:bg-accent/90 transition-colors"
          >
            {adding ? "Adding…" : "+ Add"}
          </button>
        </div>
        <p className="text-[10px] text-subtle/40 mt-1.5">Cost = points deducted · Cooldown = seconds between redeems per viewer</p>
      </div>
    </div>
  );
}
