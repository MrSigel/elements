"use client";

type OverlayRow = {
  id: string;
  name: string;
  width: number;
  height: number;
  is_published: boolean;
  overlay_tokens?: { public_token: string; revoked: boolean }[];
};

export function OverlayTable({ overlays }: { overlays: OverlayRow[] }) {
  async function publish(id: string, published: boolean) {
    await fetch(`/api/overlay/${id}/publish`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published }) });
    location.reload();
  }

  async function rotate(id: string) { await fetch(`/api/overlay/${id}/rotate-token`, { method: "POST" }); location.reload(); }
  async function revoke(id: string) { await fetch(`/api/overlay/${id}/revoke-token`, { method: "POST" }); location.reload(); }
  async function duplicate(id: string) { await fetch(`/api/overlay/${id}/duplicate`, { method: "POST" }); location.reload(); }
  async function remove(id: string) { await fetch(`/api/overlay/${id}/delete`, { method: "DELETE" }); location.reload(); }

  return (
    <div className="space-y-3">
      {overlays.map((o) => (
        <div key={o.id} className="rounded-lg border border-panelMuted bg-panel p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium">{o.name}</p>
              <p className="text-xs text-subtle">{o.width}x{o.height} • {o.is_published ? "Published" : "Draft"}</p>
              <p className="text-xs text-subtle font-mono break-all">{o.overlay_tokens?.[0]?.public_token ?? "No token"}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => publish(o.id, !o.is_published)} className="rounded bg-panelMuted px-3 py-2">{o.is_published ? "Unpublish" : "Publish"}</button>
              <button onClick={() => rotate(o.id)} className="rounded bg-panelMuted px-3 py-2">Rotate Token</button>
              <button onClick={() => revoke(o.id)} className="rounded bg-panelMuted px-3 py-2">Revoke Token</button>
              <button onClick={() => duplicate(o.id)} className="rounded bg-panelMuted px-3 py-2">Duplicate</button>
              <button onClick={() => remove(o.id)} className="rounded bg-danger/20 text-danger px-3 py-2">Delete</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

