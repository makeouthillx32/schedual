"use client";

import { useEffect, useRef } from "react";

type UseRealtimeParams<T> = {
  supabase: any;
  table: string;
  filter?: string;
  event?: "INSERT" | "UPDATE" | "DELETE" | "*";
  onEvent: (payload: {
    new: T;
    old: T | null;
    eventType: string;
  }) => void;
  channelNamePrefix?: string;
};

export function useRealtime<T>({
  supabase,
  table,
  filter,
  event = "INSERT",
  onEvent,
  channelNamePrefix = "realtime",
}: UseRealtimeParams<T>) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!table || !supabase) {
      console.log("[Realtime] Missing required params:", {
        table,
        hasSupabase: !!supabase,
      });
      return;
    }

    const channelName = `${channelNamePrefix}-${table}-${filter ?? "all"}-${Date.now()}`;
    console.log(`[Realtime] Creating channel: ${channelName}`, {
      table,
      filter,
      event,
    });

    if (channelRef.current) {
      console.log(`[Realtime] Removing existing channel before creating new one`);
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    let filterParams: Record<string, string> = {};

    if (filter) {
      console.log(`[Realtime] Parsing filter: "${filter}"`);
      const eqMatch = filter.match(/^([^=]+)=eq\.(.+)$/);
      if (eqMatch) {
        filterParams[eqMatch[1]] = `eq.${eqMatch[2]}`;
        console.log(`[Realtime] Created filter params:`, filterParams);
      } else {
        console.warn(`[Realtime] Could not parse filter: "${filter}"`);
      }
    }

    try {
      const channel = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          {
            event,
            schema: "public",
            table,
            ...filterParams,
          },
          (payload: any) => {
            console.log(`[Realtime] Received ${payload.eventType} event:`, payload);
            try {
              onEvent({
                new: payload.new as T,
                old: payload.old as T | null,
                eventType: payload.eventType,
              });
            } catch (err) {
              console.error(`[Realtime] Error processing event:`, err);
            }
          }
        )
        .subscribe((status: string) => {
          console.log(`[Realtime] Channel ${channelName} status: ${status}`);
          if (status === "SUBSCRIBED") {
            console.log(`[Realtime] Successfully subscribed to ${table} ${event} events`);
          } else if (status === "TIMED_OUT") {
            console.error(`[Realtime] Subscription timed out for ${channelName}`);
          } else if (status === "CHANNEL_ERROR") {
            console.error(`[Realtime] Channel error for ${channelName}`);
          } else if (status !== "SUBSCRIBED") {
            console.warn(`[Realtime] Unexpected subscription status: ${status}`);
          }
        });

      channelRef.current = channel;
      console.log(`[Realtime] Channel created and stored in ref:`, channelRef.current);
    } catch (err) {
      console.error(`[Realtime] Error creating channel:`, err);
    }

    return () => {
      console.log(`[Realtime] Cleaning up channel: ${channelName}`);
      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
          console.log(`[Realtime] Successfully removed channel ${channelName}`);
        } catch (err) {
          console.error(`[Realtime] Error removing channel:`, err);
        }
        channelRef.current = null;
      }
    };
  }, [supabase, table, filter, event, onEvent, channelNamePrefix]);
}

// Simpler hook for INSERT-only usage
export function useRealtimeInsert<T>({
  supabase,
  table,
  filter,
  onInsert,
}: {
  supabase: any;
  table: string;
  filter?: string;
  onInsert: (newRow: T) => void;
}) {
  return useRealtime<T>({
    supabase,
    table,
    filter,
    event: "INSERT",
    onEvent: ({ new: newRow }) => {
      if (newRow) onInsert(newRow);
    },
  });
}
