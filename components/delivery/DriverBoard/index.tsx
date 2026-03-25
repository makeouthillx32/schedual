"use client";

import { useState, useEffect, useCallback } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";
import { DeliveryOrder, STATUS_CFG } from "@/types/delivery";
import { getLocalDate } from "@/utils/deliveryUtils";
import { TrashRun, FilterView } from "../_components/types";
import { OrderCard }      from "../_components/OrderCard";
import { TrashRunsPanel } from "../_components/TrashRunsPanel";

interface DriverBoardProps {
  supabase:       SupabaseClient;
  isDark:         boolean;
  onCountsChange: (today: number, upcoming: number) => void;
}

export default function DriverBoard({ supabase, isDark, onCountsChange }: DriverBoardProps) {
  const today = getLocalDate();

  // ── Orders ─────────────────────────────────────────────────────────────────
  const [orders,   setOrders]   = useState<DeliveryOrder[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState<FilterView>("today");
  const [updating, setUpdating] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  // ── Reschedule ─────────────────────────────────────────────────────────────
  const [editingId,   setEditingId]   = useState<string | null>(null);
  const [pendingTime, setPendingTime] = useState<string>("");
  const [pendingDate, setPendingDate] = useState<string>("");

  // ── Trash runs ─────────────────────────────────────────────────────────────
  const [trashRuns, setTrashRuns] = useState<TrashRun[]>([]);

  // ── Fetches ────────────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("delivery_orders")
      .select("*")
      .neq("status", "cancelled")
      .order("scheduled_date", { ascending: true })
      .order("scheduled_time",  { ascending: true });

    if (filter === "today")    query = query.or(`scheduled_date.eq.${today},scheduled_date.is.null`);
    if (filter === "upcoming") query = query.gte("scheduled_date", today);

    const { data } = await query;
    const rows = (data ?? []) as DeliveryOrder[];
    setOrders(rows);
    onCountsChange(
      rows.filter((o) => o.status !== "completed" && (o.scheduled_date === today || !o.scheduled_date)).length,
      rows.filter((o) => o.status !== "completed" && o.scheduled_date && o.scheduled_date > today).length,
    );
    setLoading(false);
  }, [supabase, filter, today, onCountsChange]);

  const fetchTrashRuns = useCallback(async () => {
    const todayPT = getLocalDate();
    const nowLA   = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
    const offsetH = Math.round((new Date().getTime() - nowLA.getTime()) / 3600000);
    const off     = `-${String(offsetH).padStart(2, "0")}:00`;
    const startUTC = new Date(todayPT + "T00:00:00" + off).toISOString();
    const endUTC   = new Date(todayPT + "T23:59:59" + off).toISOString();
    const { data } = await supabase
      .from("trash_runs").select("*")
      .gte("created_at", startUTC).lte("created_at", endUTC)
      .order("created_at", { ascending: false });
    if (data) setTrashRuns(data as TrashRun[]);
  }, [supabase]);

  useEffect(() => {
    fetchOrders();
    fetchTrashRuns();
    const ch = supabase
      .channel("driver_board_rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "delivery_orders" }, fetchOrders)
      .on("postgres_changes", { event: "*", schema: "public", table: "trash_runs" },      fetchTrashRuns)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [fetchOrders, fetchTrashRuns]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const advanceStatus = async (order: DeliveryOrder) => {
    const cfg = STATUS_CFG[order.status];
    if (!cfg.next) return;
    if (cfg.next === "completed" && !window.confirm(`Mark "${order.customer_name}" as completed?`)) return;
    const snapshot = [...orders];
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: cfg.next! } : o)));
    setUpdating(order.id);
    try {
      const { error } = await supabase.from("delivery_orders")
        .update({ status: cfg.next, ...(cfg.next === "completed" ? { completed_at: new Date().toISOString() } : {}) })
        .eq("id", order.id);
      if (error) throw error;
    } catch {
      setOrders(snapshot);
      alert("Failed to update order status.");
    } finally {
      setUpdating(null);
    }
  };

  const to24h = (t: string) => {
    const [time, mod] = t.split(" ");
    let [h, m] = time.split(":").map(Number);
    if (mod === "PM" && h !== 12) h += 12;
    if (mod === "AM" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
  };

  const saveReschedule = async (orderId: string) => {
    if (!pendingTime) return;
    const snapshot = [...orders];
    const override = to24h(pendingTime);
    const update: Record<string, string | null> = { scheduled_time_override: override };
    if (pendingDate) update.scheduled_date = pendingDate;
    setOrders((prev) => prev.map((o) =>
      o.id === orderId ? { ...o, scheduled_time_override: override, ...(pendingDate ? { scheduled_date: pendingDate } : {}) } : o
    ));
    setEditingId(null);
    setPendingDate("");
    try {
      const { error } = await supabase.from("delivery_orders").update(update).eq("id", orderId);
      if (error) throw error;
    } catch {
      setOrders(snapshot);
      alert("Failed to save reschedule.");
    }
  };

  const clearReschedule = async (orderId: string) => {
    const snapshot = [...orders];
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, scheduled_time_override: null } : o)));
    try {
      await supabase.from("delivery_orders").update({ scheduled_time_override: null }).eq("id", orderId);
    } catch {
      setOrders(snapshot);
      alert("Failed to clear reschedule.");
    }
  };

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

  // ── Render ─────────────────────────────────────────────────────────────────
  const activeOrders    = orders.filter((o) => o.status !== "completed");
  const completedOrders = orders.filter((o) => o.status === "completed");

  const cardProps = (order: DeliveryOrder) => ({
    order,
    isDark,
    isExpanded:  expanded === order.id,
    isUpdating:  updating === order.id,
    isEditing:   editingId === order.id,
    pendingDate,
    pendingTime,
    onToggleExpand:  () => setExpanded(expanded === order.id ? null : order.id),
    onAdvanceStatus: () => advanceStatus(order),
    onStartEdit:     () => { setEditingId(order.id); setPendingTime(""); setPendingDate(""); },
    onDateChange:    setPendingDate,
    onTimeChange:    setPendingTime,
    onSave:          () => saveReschedule(order.id),
    onCancelEdit:    () => { setEditingId(null); setPendingDate(""); },
    onReset:         () => clearReschedule(order.id),
  });

  return (
    <div className="space-y-4">

      <TrashRunsPanel
        supabase={supabase}
        isDark={isDark}
        runs={trashRuns}
        onToggle={toggleTrashRun}
        onAdd={addTrashRun}
      />

      {/* Filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {(["today", "upcoming", "all"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}>
            <Badge variant={filter === f ? "default" : "outline"}>
              {f === "today" ? "Today" : f === "upcoming" ? "Upcoming" : "All"}
            </Badge>
          </button>
        ))}
        <button
          onClick={fetchOrders}
          className="ml-auto p-1.5 rounded-[var(--radius)] border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] transition-colors"
          title="Refresh"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Order list */}
      {loading ? (
        <p className="text-center py-12 text-sm text-[hsl(var(--muted-foreground))]">Loading orders…</p>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 flex flex-col items-center gap-2 text-[hsl(var(--muted-foreground))]">
          <span className="text-4xl">🎉</span>
          <p className="text-sm font-medium">No orders for this view.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeOrders.map((o) => <OrderCard key={o.id} {...cardProps(o)} />)}

          {completedOrders.length > 0 && (
            <>
              <div className="flex items-center gap-2 pt-2">
                <div className="flex-1 h-px bg-green-200" />
                <span className="text-xs font-bold text-green-600 uppercase tracking-wider">
                  ✓ Completed ({completedOrders.length})
                </span>
                <div className="flex-1 h-px bg-green-200" />
              </div>
              {completedOrders.map((o) => <OrderCard key={o.id} {...cardProps(o)} />)}
            </>
          )}
        </div>
      )}
    </div>
  );
}