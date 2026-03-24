"use client";

import { useState, useEffect, useCallback } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";
import { DeliveryOrder, STATUS_CFG, PAYMENT_COLOR } from "@/types/delivery";
import { getLocalDate, formatDeliveryDate, formatDeliveryTime } from "@/utils/deliveryUtils";

type FilterView = "today" | "upcoming" | "all";

interface DriverBoardProps {
  supabase: SupabaseClient;
  isDark: boolean;
  onCountsChange: (today: number, upcoming: number) => void;
}

export default function DriverBoard({ supabase, isDark, onCountsChange }: DriverBoardProps) {
  const today = getLocalDate();
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterView>("today");
  const [updating, setUpdating] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("delivery_orders")
      .select("*")
      .not("status", "in", '("cancelled","completed")')
      .order("scheduled_date", { ascending: true })
      .order("scheduled_time", { ascending: true });

    if (filter === "today")    query = query.or(`scheduled_date.eq.${today},scheduled_date.is.null`);
    if (filter === "upcoming") query = query.gte("scheduled_date", today);

    const { data } = await query;
    const rows = (data ?? []) as DeliveryOrder[];
    setOrders(rows);

    onCountsChange(
      rows.filter((o) => o.scheduled_date === today || !o.scheduled_date).length,
      rows.filter((o) => o.scheduled_date && o.scheduled_date > today).length,
    );
    setLoading(false);
  }, [supabase, filter, today, onCountsChange]);

  useEffect(() => {
    fetchOrders();
    const ch = supabase
      .channel("driver_board_rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "delivery_orders" }, fetchOrders)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [fetchOrders]);

  // ── advanceStatus — modeled after CleanTrack's updateBusinessStatus ────────
  // 1. confirm() on completed (irreversible)
  // 2. snapshot for rollback
  // 3. optimistic setOrders — instant UI
  // 4. supabase update
  // 5. rollback + alert on error

  const advanceStatus = async (order: DeliveryOrder) => {
    const cfg = STATUS_CFG[order.status];
    if (!cfg.next) return;

    if (cfg.next === "completed") {
      const ok = window.confirm(
        `Mark "${order.customer_name}" as completed?\n\nThis will remove the order from the active board.`
      );
      if (!ok) return;
    }

    const snapshot = [...orders];

    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, status: cfg.next! } : o))
    );
    setUpdating(order.id);

    try {
      const { error } = await supabase
        .from("delivery_orders")
        .update({
          status: cfg.next,
          ...(cfg.next === "completed" ? { completed_at: new Date().toISOString() } : {}),
        })
        .eq("id", order.id);

      if (error) throw error;
    } catch (err) {
      console.error("❌ Error updating order status:", err);
      setOrders(snapshot);
      alert("Failed to update order status. Please try again.");
    } finally {
      setUpdating(null);
    }
  };

  // ── Status icon — same shape as CleanTrack's getStatusIcon ────────────────

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":   return <span className="text-xl">✅</span>;
      case "in_progress": return <span className="text-xl">🔄</span>;
      case "assigned":    return <span className="text-xl">📋</span>;
      default:            return <span className="text-xl text-[hsl(var(--muted-foreground))]">⭕</span>;
    }
  };

  // ── Status text — same shape as CleanTrack's getStatusText ────────────────

  const getStatusText = (order: DeliveryOrder) => {
    switch (order.status) {
      case "completed":
        return <span className="text-green-600 font-medium text-xs">✓ Completed</span>;
      case "in_progress":
        return <span className="text-purple-600 font-medium text-xs">🔄 In Progress</span>;
      case "assigned":
        return <span className="text-blue-600 font-medium text-xs">📋 Assigned</span>;
      default:
        return <span className="text-xs text-[hsl(var(--muted-foreground))]">Pending</span>;
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">

      {/* Filter + refresh */}
      <div className="flex items-center gap-2 flex-wrap">
        {(["today", "upcoming", "all"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}>
            <Badge variant={filter === f ? "default" : "outline"}>
              {f === "today" ? "Today" : f === "upcoming" ? "Upcoming" : "All Open"}
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

      {/* List */}
      {loading ? (
        <p className="text-center py-16 text-sm text-[hsl(var(--muted-foreground))]">
          Loading orders…
        </p>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center gap-2 text-[hsl(var(--muted-foreground))]">
          <span className="text-4xl">🎉</span>
          <p className="text-sm font-medium">No open orders for this view.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const cfg = STATUS_CFG[order.status];
            const isDelivery = order.order_type === "delivery";
            const primaryAddress = isDelivery ? order.destination_address : order.origin_address;
            const isExpanded = expanded === order.id;
            const isUpdating = updating === order.id;

            return (
              <div
                key={order.id}
                className={`p-4 rounded-[var(--radius)] border transition-all ${
                  isDark ? "bg-[hsl(var(--card))]" : "bg-[hsl(var(--background))]"
                } ${
                  order.status === "completed"   ? "border-green-200 bg-green-50/50"   :
                  order.status === "in_progress" ? "border-purple-200 bg-purple-50/50" :
                  "border-[hsl(var(--border))]"
                }`}
              >
                {/* Row 1: icon + name + badges + schedule */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">

                    {/* Status icon button — tap to advance, mirrors CleanTrack toggle */}
                    <button
                      onClick={() => advanceStatus(order)}
                      className="mt-1 hover:scale-110 transition-transform"
                      disabled={!cfg.next || isUpdating}
                      title={cfg.next ? cfg.nextLabel : undefined}
                    >
                      {getStatusIcon(order.status)}
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-1 mb-1">
                        <h4 className="font-semibold text-[hsl(var(--foreground))]">
                          {order.customer_name}
                        </h4>
                        <Badge variant={isDelivery ? "secondary" : "outline"}>
                          {isDelivery ? "📦 Delivery" : "🚛 Pickup"}
                        </Badge>
                        {isUpdating && (
                          <Badge variant="secondary">Updating…</Badge>
                        )}
                      </div>

                      <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">
                        {order.item_description}
                      </p>

                      <div className="flex items-center space-x-3 flex-wrap gap-1">
                        {getStatusText(order)}
                        {isDelivery && (
                          <span
                            className="text-xs font-bold"
                            style={{ color: PAYMENT_COLOR[order.payment_status] ?? "#888" }}
                          >
                            $ {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                          </span>
                        )}
                      </div>

                      {order.item_notes && (
                        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 italic">
                          📝 {order.item_notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Schedule + expand toggle */}
                  <div className="flex flex-col items-end gap-1.5 ml-2 shrink-0">
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">
                      {formatDeliveryDate(order.scheduled_date)}
                    </span>
                    {order.scheduled_time && (
                      <span className="text-xs font-semibold text-[hsl(var(--foreground))]">
                        {formatDeliveryTime(order.scheduled_time)}
                      </span>
                    )}
                    <button
                      onClick={() => setExpanded(isExpanded ? null : order.id)}
                      className="text-xs px-2 py-0.5 rounded border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] transition-colors"
                    >
                      {isExpanded ? "▲" : "▼"}
                    </button>
                  </div>
                </div>

                {/* Expanded panel — address, phone, notes, action button */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-[hsl(var(--border))] space-y-2">
                    {order.customer_phone && (
                      <a
                        href={`tel:${order.customer_phone}`}
                        className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--sidebar-primary))]"
                      >
                        📞 {order.customer_phone}
                      </a>
                    )}
                    {primaryAddress && (
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(primaryAddress)}`}
                        target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 text-sm text-[hsl(var(--sidebar-primary))]"
                      >
                        📍 {primaryAddress}
                      </a>
                    )}
                    {isDelivery && order.payment_notes && (
                      <p className="text-xs text-[hsl(var(--muted-foreground))] italic">
                        💳 {order.payment_notes}
                      </p>
                    )}
                    {isDelivery && order.origin_address && (
                      <DetailRow label="Pickup From" value={order.origin_address} />
                    )}
                    {!isDelivery && order.destination_address && (
                      <DetailRow label="Drop Off To" value={order.destination_address} />
                    )}
                    {order.taken_by && (
                      <DetailRow label="Taken By" value={order.taken_by} />
                    )}

                    {cfg.next && (
                      <Button
                        onClick={() => advanceStatus(order)}
                        disabled={isUpdating}
                        className="w-full mt-1"
                        variant={cfg.next === "completed" ? "default" : "default"}
                      >
                        {isUpdating ? "Updating…" : cfg.nextLabel}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-xs">
      <span className="font-bold shrink-0 w-24 text-[hsl(var(--muted-foreground))]">{label}:</span>
      <span className="text-[hsl(var(--foreground))]" style={{ wordBreak: "break-word" }}>{value}</span>
    </div>
  );
}