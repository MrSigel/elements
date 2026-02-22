"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";

/**
 * Invisible client component that subscribes to widget_snapshots changes for
 * the given overlayId and calls router.refresh() so the SSR viewer page
 * re-fetches its data automatically.
 */
export function RealtimeRefresher({ overlayId }: { overlayId: string }) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createBrowserClient();
    const channel = supabase
      .channel(`viewer-refresh:${overlayId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "widget_snapshots", filter: `overlay_id=eq.${overlayId}` },
        () => { router.refresh(); }
      )
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [overlayId, router]);

  return null;
}
