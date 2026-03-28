"use client";

import { useState, useEffect, useCallback } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { RefreshCw } from "lucide-react";
import { DeliveryOrder } from "@/types/delivery";
import { getLocalDate } from "@/utils/deliveryUtils";
import { TrashRun } from "@/components/delivery/_components/types";
import { TrashRunsPanel } from "@/components/delivery/_components/TrashRunsPanel";
import { OrderList } from "@/components/delivery/_components/OrderList";
import { useOrderActions } from "@/components/delivery/_components/useOrderActions";

interface TodayViewProps {
  supabase:       SupabaseClient;
  isDark:         boolean;
  onCountsChange: (today: number, upcoming: number) => void;
}

export default function TodayView({ supabase, isDark, onCountsChange }: TodayViewProps) {
  const today = getLocalDate();

  const [orders,    setOrders]    = useState<DeliveryOrder[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [trashRuns, setTrashRuns] = useState<TrashRun[]>([]);

  const { cardProps } = useOrderActions(supabase, orders, setOrders);

  // ── Fetch orders ──────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("delivery_orders")
      .select("*")
      .neq("status", "cancelled")
      .or(`scheduled_date.eq.${today},scheduled_date.is.null`)
      .order("scheduled_time", { ascending: true });
    const rows = (data ?? []) as DeliveryOrder[];
    setOrders(rows);
    onCountsChange(
      rows.filter((o) => o.status !== "completed").length,
      0, // today view doesn't count upcoming
    );
    setLoading(false);
  }, [supabase, today, onCountsChange]);

  // ── Fetch trash runs (today only, Pacific Time) ───────────────────────────
  const fetchTrashRuns = useCallback(async () => {
    const nowLA   = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
    const offsetH = Math.round((new Date().getTime() - nowLA.getTime()) / 3600000);
    const off     = `-${String(offsetH).padStart(2, "0")}:00`;
    const startUTC = new Date(today + "T00:00:00" + off).toISOString();
    const endUTC   = new Date(today + "T23:59:59" + off).toISOString();
    const { data } = await supabase
      .from("trash_runs").select("*")
      .gte("created_at", startUTC).lte("created_at", endUTC)
      .order("created_at", { ascending: false });
    if (data) setTrashRuns(data as TrashRun[]);
  }, [supabase, today]);

  // ── Realtime ──────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchOrders();
    fetchTrashRuns();
    const ch = supabase
      .channel("today_view_rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "delivery_orders" }, fetchOrders)
      .on("postgres_changes", { event: "*", schema: "public", table: "trash_runs" }, fetchTrashRuns)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [fetchOrders, fetchTrashRuns]);

  // ── Trash handlers ────────────────────────────────────────────────────────
  const addTrashRun = async (note: string) => {
    await supabase.from("trash_runs").insert({ note: note || null, status: "pending" });
    await fetchTrashRuns();
  };

  const toggleTrashRun = async (run: TrashRun) => {
    const snapshot = [...trashRuns];
    const next = run.status === "pending" ? "done" : "pending";
    setTrashRuns((prev) => prev.map((r) => (r.id === run.id ? { ...r, status: next } : r)));
    try {
      const { error } = await supabase.from("trash_runs")
        .update({ status: next, completed_at: next === "done" ? new Date().toISOString() : null })
        .eq("id", run.id);
      if (error) throw error;
    } catch {
      setTrashRuns(snapshot);
      alert("Failed to update trash run.");
    }
  };

  return (
    <div className="space-y-4">
      <TrashRunsPanel
        supabase={supabase}
        isDark={isDark}
        runs={trashRuns}
        onToggle={toggleTrashRun}
        onAdd={addTrashRun}
      />

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
          Today — {new Date(today + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
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