"use client";

import { useState, useEffect, useCallback } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { RefreshCw } from "lucide-react";
import { DeliveryOrder } from "@/types/delivery";
import { getLocalDate } from "@/utils/deliveryUtils";
import { OrderList } from "@/components/delivery/_components/OrderList";
import { useOrderActions } from "@/components/delivery/_components/useOrderActions";

interface WeekViewProps {
  supabase:       SupabaseClient;
  isDark:         boolean;
  onCountsChange: (today: number, upcoming: number) => void;
}

/** Returns the Monday and Sunday of the current week in PT */
function getWeekBounds(): { start: string; end: string } {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
  const day = now.getDay(); // 0 = Sun
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7)); // back to Mon
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  return { start: fmt(monday), end: fmt(sunday) };
}

export default function WeekView({ supabase, isDark, onCountsChange }: WeekViewProps) {
  const today = getLocalDate();
  const { start, end } = getWeekBounds();

  const [orders,  setOrders]  = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const { cardProps } = useOrderActions(supabase, orders, setOrders);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("delivery_orders")
      .select("*")
      .neq("status", "cancelled")
      .gte("scheduled_date", start)
      .lte("scheduled_date", end)
      .order("scheduled_date", { ascending: true })
      .order("scheduled_time",  { ascending: true });
    const rows = (data ?? []) as DeliveryOrder[];
    setOrders(rows);
    onCountsChange(
      rows.filter((o) => o.status !== "completed" && (o.scheduled_date === today || !o.scheduled_date)).length,
      rows.filter((o) => o.status !== "completed" && o.scheduled_date && o.scheduled_date > today).length,
    );
    setLoading(false);
  }, [supabase, start, end, today, onCountsChange]);

  useEffect(() => {
    fetchOrders();
    const ch = supabase
      .channel("week_view_rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "delivery_orders" }, fetchOrders)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [fetchOrders]);

  // Week label e.g. "Mar 24 – Mar 30"
  const weekLabel = (() => {
    const fmt = (s: string) => new Date(s + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `${fmt(start)} – ${fmt(end)}`;
  })();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
          This Week — {weekLabel}
        </span>
        <button
          onClick={fetchOrders}
          className="p-1.5 rounded-[var(--radius)] border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] transition-colors"
          title="Refresh"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      <OrderList orders={orders} loading={loading} isDark={isDark} cardProps={cardProps} />
    </div>
  );
}