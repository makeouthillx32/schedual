"use client";

import { useEffect } from "react";
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
  useEffect(() => {
    const channelId = filter ? `${table}:${filter}` : `${table}-insert`;
    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table,
          ...(filter ? { filter } : {}),
        },
        (payload) => {
          onInsert(payload.new as T);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter, onInsert]);
}