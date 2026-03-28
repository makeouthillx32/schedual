"use client";

import { useState, useEffect, useCallback } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { RefreshCw } from "lucide-react";
import { DeliveryOrder } from "@/types/delivery";
import { getLocalDate } from "@/utils/deliveryUtils";
import { OrderList } from "@/components/delivery/_components/OrderList";
import { useOrderActions } from "@/components/delivery/_components/useOrderActions";

interface AllViewProps {
  supabase:       SupabaseClient;
  isDark:         boolean;
  onCountsChange: (today: number, upcoming: number) => void;
}

/**
 * AllView — every non-cancelled order.
 * Currently renders as a flat card list.
 * TODO: replace with horizontal day-column carousel once UI design is confirmed.
 */
export default function AllView({ supabase, isDark, onCountsChange }: AllViewProps) {
  const today = getLocalDate();

  const [orders,  setOrders]  = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const { cardProps } = useOrderActions(supabase, orders, setOrders);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("delivery_orders")
      .select("*")
      .neq("status", "cancelled")
      .order("scheduled_date", { ascending: true })
      .order("scheduled_time",  { ascending: true });
    const rows = (data ?? []) as DeliveryOrder[];
    setOrders(rows);
    onCountsChange(
      rows.filter((o) => o.status !== "completed" && (o.scheduled_date === today || !o.scheduled_date)).length,
      rows.filter((o) => o.status !== "completed" && o.scheduled_date && o.scheduled_date > today).length,
    );
    setLoading(false);
  }, [supabase, today, onCountsChange]);

  useEffect(() => {
    fetchOrders();
    const ch = supabase
      .channel("all_view_rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "delivery_orders" }, fetchOrders)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [fetchOrders]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
          All Orders
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