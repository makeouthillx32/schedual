"use client";

import { useState, useCallback } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { DeliveryOrder, STATUS_CFG } from "@/types/delivery";

/**
 * useOrderActions — shared mutation logic for all three views.
 * Each view imports this hook and passes its own orders/setOrders.
 */
export function useOrderActions(
  supabase: SupabaseClient,
  orders: DeliveryOrder[],
  setOrders: React.Dispatch<React.SetStateAction<DeliveryOrder[]>>,
) {
  const [updating, setUpdating] = useState<string | null>(null);

  // ── Reschedule state ──────────────────────────────────────────────────────
  const [editingId,   setEditingId]   = useState<string | null>(null);
  const [pendingTime, setPendingTime] = useState<string>("");
  const [pendingDate, setPendingDate] = useState<string>("");

  // ── Status ────────────────────────────────────────────────────────────────
  const advanceStatus = useCallback(async (order: DeliveryOrder) => {
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
  }, [supabase, orders, setOrders]);

  const undoStatus = useCallback(async (order: DeliveryOrder) => {
    const cfg = STATUS_CFG[order.status];
    if (!cfg.prev) return;
    const snapshot = [...orders];
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: cfg.prev! } : o)));
    setUpdating(order.id);
    try {
      const { error } = await supabase.from("delivery_orders")
        .update({ status: cfg.prev, completed_at: null })
        .eq("id", order.id);
      if (error) throw error;
    } catch {
      setOrders(snapshot);
      alert("Failed to undo status.");
    } finally {
      setUpdating(null);
    }
  }, [supabase, orders, setOrders]);

  const deleteOrder = useCallback(async (order: DeliveryOrder) => {
    if (!window.confirm(`Remove "${order.customer_name}" (${order.order_type})? This cannot be undone.`)) return;
    const snapshot = [...orders];
    setOrders((prev) => prev.filter((o) => o.id !== order.id));
    try {
      const { error } = await supabase.from("delivery_orders").delete().eq("id", order.id);
      if (error) throw error;
    } catch {
      setOrders(snapshot);
      alert("Failed to remove order.");
    }
  }, [supabase, orders, setOrders]);

  // ── Reschedule ────────────────────────────────────────────────────────────
  const to24h = (t: string) => {
    const [time, mod] = t.split(" ");
    let [h, m] = time.split(":").map(Number);
    if (mod === "PM" && h !== 12) h += 12;
    if (mod === "AM" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
  };

  const saveReschedule = useCallback(async (orderId: string) => {
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
  }, [supabase, orders, setOrders, pendingTime, pendingDate]);

  const clearReschedule = useCallback(async (orderId: string) => {
    const snapshot = [...orders];
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, scheduled_time_override: null } : o)));
    try {
      await supabase.from("delivery_orders").update({ scheduled_time_override: null }).eq("id", orderId);
    } catch {
      setOrders(snapshot);
      alert("Failed to clear reschedule.");
    }
  }, [supabase, orders, setOrders]);

  // ── Card props factory ────────────────────────────────────────────────────
  const [expanded, setExpanded] = useState<string | null>(null);

  const cardProps = useCallback((order: DeliveryOrder) => ({
    order,
    isExpanded:      expanded === order.id,
    isUpdating:      updating === order.id,
    isEditing:       editingId === order.id,
    pendingDate,
    pendingTime,
    onToggleExpand:  () => setExpanded((e) => e === order.id ? null : order.id),
    onAdvanceStatus: () => advanceStatus(order),
    onUndoStatus:    () => undoStatus(order),
    onStartEdit:     () => { setEditingId(order.id); setPendingTime(""); setPendingDate(""); },
    onDateChange:    setPendingDate,
    onTimeChange:    setPendingTime,
    onSave:          () => saveReschedule(order.id),
    onCancelEdit:    () => { setEditingId(null); setPendingDate(""); },
    onReset:         () => clearReschedule(order.id),
    onDelete:        () => deleteOrder(order),
  }), [
    expanded, updating, editingId, pendingDate, pendingTime,
    advanceStatus, undoStatus, deleteOrder, saveReschedule, clearReschedule,
  ]);

  return { cardProps };
}