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

    // Unsubscribe any old channel before creating new one
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table,
          ...(filter ? { filter } : {}),
        },
        (payload) => {
          const newRow = payload.new as T;
          onInsert(newRow);
        }
      )
      .subscribe((status) => {
        if (status !== "SUBSCRIBED") {
          console.warn(`[Realtime] Failed to subscribe to ${channelName}`);
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [table, filter, onInsert]);
}