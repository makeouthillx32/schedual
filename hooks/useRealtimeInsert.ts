// hooks/useRealtimeInsert.ts
"use client";

import { useEffect, useRef } from "react";
import { useSessionContext } from "@supabase/auth-helpers-react";

export function useRealtimeInsert<T>({ table, filter, onInsert }: { table: string; filter?: string; onInsert: (newRow: T) => void; }) {
  const { supabaseClient } = useSessionContext();
  const callbackRef = useRef(onInsert);

  // keep callback ref up to date
  useEffect(() => { callbackRef.current = onInsert; }, [onInsert]);

  useEffect(() => {
    if (!table || !filter) return;

    const channelName = `realtime_${table}_${filter}`;
    console.log(`[Realtime] subscribing to ${channelName}`);

    const channel = supabaseClient
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table, filter },
        (payload) => {
          console.log(`[Realtime] received INSERT on ${channelName}:`, payload.new);
          callbackRef.current(payload.new as T);
        }
      )
      .subscribe((status) => {
        console.log(`[Realtime] subscription status for ${channelName}:`, status);
      });

    return () => {
      console.log(`[Realtime] unsubscribing from ${channelName}`);
      supabaseClient.removeChannel(channel);
    };
  }, [table, filter, supabaseClient]);
}
