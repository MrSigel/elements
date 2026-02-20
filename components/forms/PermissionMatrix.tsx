"use client";

import { useMemo, useState } from "react";

const PERMISSIONS = [
  "overlay_publish","overlay_delete","overlay_token_rotate","overlay_token_revoke",
  "widget_manage","widget_action","frontpage_manage","logs_export","mod_manage"
] as const;

type Role = { id: string; role: string; channel_id: string; user_id: string; users?: { twitch_login?: string; twitch_display_name?: string }[] };
type Permission = { id: string; channel_role_id: string; permission_key: string; overlay_id: string | null; widget_instance_id: string | null };
type Overlay = { id: string; name: string };
type Widget = { id: string; name: string; overlay_id: string };

export function PermissionMatrix({ roles, permissions, overlays, widgets }: { roles: Role[]; permissions: Permission[]; overlays: Overlay[]; widgets: Widget[] }) {
  const [overlayScope, setOverlayScope] = useState("global");
  const [widgetScope, setWidgetScope] = useState("global");

  const scopedWidgets = useMemo(() => {
    if (overlayScope === "global") return widgets;
    return widgets.filter((w) => w.overlay_id === overlayScope);
  }, [widgets, overlayScope]);

  async function toggle(roleId: string, key: string, enabled: boolean) {
    await fetch("/api/moderation/permissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channelRoleId: roleId,
        permissionKey: key,
        enabled,
        overlayId: overlayScope === "global" ? null : overlayScope,
        widgetInstanceId: widgetScope === "global" ? null : widgetScope
      })
    });
    location.reload();
  }

  return (
    <div className="space-y-3">
      <div className="rounded border border-panelMuted bg-panel p-3 flex gap-2">
        <select value={overlayScope} onChange={(e) => { setOverlayScope(e.target.value); setWidgetScope("global"); }} className="rounded bg-panelMuted px-3 py-2">
          <option value="global">Global overlay scope</option>
          {overlays.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
        <select value={widgetScope} onChange={(e) => setWidgetScope(e.target.value)} className="rounded bg-panelMuted px-3 py-2">
          <option value="global">Global widget scope</option>
          {scopedWidgets.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
      </div>

      {roles.filter((r) => r.role === "moderator").map((r) => (
        <div key={r.id} className="rounded border border-panelMuted bg-panel p-3">
          <p className="font-medium mb-2">{r.users?.[0]?.twitch_display_name ?? r.user_id}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {PERMISSIONS.map((p) => {
              const has = permissions.some((perm) =>
                perm.channel_role_id === r.id &&
                perm.permission_key === p &&
                (overlayScope === "global" ? !perm.overlay_id : perm.overlay_id === overlayScope) &&
                (widgetScope === "global" ? !perm.widget_instance_id : perm.widget_instance_id === widgetScope)
              );
              return (
                <button key={p} onClick={() => toggle(r.id, p, !has)} className={`rounded px-2 py-1 text-xs ${has ? "bg-accent text-black" : "bg-panelMuted"}`}>
                  {p}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

