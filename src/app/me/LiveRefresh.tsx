"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const FALLBACK_INTERVAL_MS = 15_000;

/**
 * Re-renders the page when someone joins or the draw finishes.
 * Supabase Realtime pushes changes to participants and draw (RLS applies);
 * a 15 s refresh and a refresh on returning to the tab cover dropped sockets.
 * Renders nothing.
 */
export function LiveRefresh() {
  const router = useRouter();

  useEffect(() => {
    let pending: ReturnType<typeof setTimeout> | undefined;
    // Several rows change at once when the draw runs: refresh once.
    const refresh = () => {
      clearTimeout(pending);
      pending = setTimeout(() => router.refresh(), 300);
    };

    const supabase = createClient();
    const channel = supabase
      .channel("waiting-room")
      .on("postgres_changes", { event: "*", schema: "public", table: "participants" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "draw" }, refresh)
      .subscribe();

    const interval = setInterval(refresh, FALLBACK_INTERVAL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearTimeout(pending);
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      void supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
