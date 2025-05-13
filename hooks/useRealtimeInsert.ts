"use client";

import { useEffect, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type UseRealtimeInsertParams<T> = {
  table: string;
  filter?: string;
  onInsert: (newRow: T) => void;
};

export function useRealtimeInsert<T>({ table, filter, onInsert }: UseRealtimeInsertParams<T>) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!table) return;

    const channelName = `realtime-${table}-${filter ?? "all"}`;
    console.log(`[Realtime] Setting up channel: ${channelName}`);

    // Unsubscribe any old channel before creating new one
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    // Parse the filter if provided
    let filterObj = {};
    if (filter) {
      // Handle eq.value format
      const eqMatch = filter.match(/^([^=]+)=eq\.(.+)$/);
      if (eqMatch) {
        filterObj = { column: eqMatch[1], value: eqMatch[2] };
      }
    }

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table,
          ...(filter ? filterObj : {}),
        },
        (payload) => {
          console.log("[Realtime] Received new row:", payload.new);
          const newRow = payload.new as T;
          onInsert(newRow);
        }
      )
      .subscribe((status) => {
        console.log(`[Realtime] Channel ${channelName} status: ${status}`);
        if (status !== "SUBSCRIBED") {
          console.warn(`[Realtime] Failed to subscribe to ${channelName}`);
        }
      });

    channelRef.current = channel;

    return () => {
      console.log(`[Realtime] Cleaning up channel: ${channelName}`);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [table, filter, onInsert]);
}