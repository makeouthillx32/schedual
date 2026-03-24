"use client";

import { useState, useEffect, useCallback } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Plus, Trash2, CheckCircle2, Circle, Clock } from "lucide-react";
import { DeliveryOrder, STATUS_CFG, PAYMENT_COLOR, TIME_SLOTS } from "@/types/delivery";
import { getLocalDate, formatDeliveryDate, formatDeliveryTime } from "@/utils/deliveryUtils";

type FilterView = "today" | "upcoming" | "all";

interface TrashRun {
  id: string;
  note: string | null;
  status: "pending" | "done";
  created_at: string;
  completed_at: string | null;
}

interface DriverBoardProps {
  supabase: SupabaseClient;
  isDark: boolean;
  onCountsChange: (today: number, upcoming: number) => void;
}

export default function DriverBoard({ supabase, isDark, onCountsChange }: DriverBoardProps) {
  const today = getLocalDate();

  const [orders,   setOrders]   = useState<DeliveryOrder[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState<FilterView>("today");
  const [updating, setUpdating] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Time override UI
  const [editingTime, setEditingTime] = useState<string | null>(null);
  const [pendingTime, setPendingTime] = useState<string>("");

  // Trash runs
  const [trashRuns,    setTrashRuns]    = useState<TrashRun[]>([]);
  const [showAddTrash, setShowAddTrash] = useState(false);
  const [trashNote,    setTrashNote]    = useState("");
  const [addingTrash,  setAddingTrash]  = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    setLoading(true);

    // NOTE: We no longer filter out "completed" — they stay visible on the board
    // cancelled is still hidden since it's a different state
    let query = supabase
      .from("delivery_orders")
      .select("*")
      .neq("status", "cancelled")
      .order("scheduled_date", { ascending: true })
      .order("scheduled_time", { ascending: true });

    if (filter === "today")    query = query.or(`scheduled_date.eq.${today},scheduled_date.is.null`);
    if (filter === "upcoming") query = query.gte("scheduled_date", today);

    const { data } = await query;
    const rows = (data ?? []) as DeliveryOrder[];
    setOrders(rows);

    // Counts only show non-completed for the header chips
    onCountsChange(
      rows.filter((o) => o.status !== "completed" && (o.scheduled_date === today || !o.scheduled_date)).length,
      rows.filter((o) => o.status !== "completed" && o.scheduled_date && o.scheduled_date > today).length,
    );
    setLoading(false);
  }, [supabase, filter, today, onCountsChange]);

  const fetchTrashRuns = useCallback(async () => {
    const { data } = await supabase
      .from("trash_runs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);
    if (data) setTrashRuns(data as TrashRun[]);
  }, [supabase]);

  useEffect(() => {
    fetchOrders();
    fetchTrashRuns();
    const ch = supabase
      .channel("driver_board_rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "delivery_orders" }, fetchOrders)
      .on("postgres_changes", { event: "*", schema: "public", table: "trash_runs" },     fetchTrashRuns)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [fetchOrders, fetchTrashRuns]);

  // ── Status advance ─────────────────────────────────────────────────────────
  const advanceStatus = async (order: DeliveryOrder) => {
    const cfg = STATUS_CFG[order.status];
    if (!cfg.next) return;

    if (cfg.next === "completed") {
      const ok = window.confirm(`Mark "${order.customer_name}" as completed?`);
      if (!ok) return;
    }

    const snapshot = [...orders];
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: cfg.next! } : o)));
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
      console.error("❌", err);
      setOrders(snapshot);
      alert("Failed to update order status. Please try again.");
    } finally {
      setUpdating(null);
    }
  };

  // ── Time override ──────────────────────────────────────────────────────────
  const to24h = (t: string): string => {
    const [time, mod] = t.split(" ");
    let [h, m] = time.split(":").map(Number);
    if (mod === "PM" && h !== 12) h += 12;
    if (mod === "AM" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
  };

  const saveTimeOverride = async (orderId: string) => {
    if (!pendingTime) return;
    const snapshot = [...orders];
    const override = to24h(pendingTime);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, scheduled_time_override: override } : o)));
    setEditingTime(null);
    try {
      const { error } = await supabase
        .from("delivery_orders")
        .update({ scheduled_time_override: override })
        .eq("id", orderId);
      if (error) throw error;
    } catch (err) {
      setOrders(snapshot);
      alert("Failed to save time change.");
    }
  };

  const clearTimeOverride = async (orderId: string) => {
    const snapshot = [...orders];
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, scheduled_time_override: null } : o)));
    try {
      await supabase.from("delivery_orders").update({ scheduled_time_override: null }).eq("id", orderId);
    } catch (err) {
      setOrders(snapshot);
      alert("Failed to clear time change.");
    }
  };

  // ── Trash runs ─────────────────────────────────────────────────────────────
  const handleConfirmAddTrash = async () => {
    if (addingTrash) return;
    setAddingTrash(true);
    try {
      await supabase.from("trash_runs").insert({ note: trashNote.trim() || null, status: "pending" });
      setTrashNote("");
      setShowAddTrash(false);
      await fetchTrashRuns();
    } catch (err) {
      alert("Failed to add trash run.");
    } finally {
      setAddingTrash(false);
    }
  };

  const toggleTrashRun = async (run: TrashRun) => {
    const snapshot = [...trashRuns];
    const next = run.status === "pending" ? "done" : "pending";
    setTrashRuns((prev) => prev.map((r) => (r.id === run.id ? { ...r, status: next } : r)));
    try {
      const { error } = await supabase
        .from("trash_runs")
        .update({ status: next, completed_at: next === "done" ? new Date().toISOString() : null })
        .eq("id", run.id);
      if (error) throw error;
    } catch (err) {
      setTrashRuns(snapshot);
      alert("Failed to update trash run.");
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const effectiveTime = (order: DeliveryOrder) => order.scheduled_time_override ?? order.scheduled_time;

  const getStatusIcon = (order: DeliveryOrder) => {
    switch (order.status) {
      case "completed":   return <CheckCircle2 size={20} className="text-green-600" />;
      case "in_progress": return <span className="text-xl">🔄</span>;
      case "assigned":    return <span className="text-xl">📋</span>;
      default:            return <Circle size={20} className="text-[hsl(var(--muted-foreground))]" />;
    }
  };

  const getStatusText = (order: DeliveryOrder) => {
    switch (order.status) {
      case "completed":
        return (
          <span className="text-green-600 font-medium text-xs">
            ✓ Completed {order.completed_at ? `at ${new Date(order.completed_at).toLocaleTimeString()}` : ""}
          </span>
        );
      case "in_progress": return <span className="text-purple-600 font-medium text-xs">🔄 In Progress</span>;
      case "assigned":    return <span className="text-blue-600   font-medium text-xs">📋 Assigned</span>;
      default:            return <span className="text-xs text-[hsl(var(--muted-foreground))]">Pending</span>;
    }
  };

  // Separate active from completed for visual grouping
  const activeOrders    = orders.filter((o) => o.status !== "completed");
  const completedOrders = orders.filter((o) => o.status === "completed");

  const renderOrder = (order: DeliveryOrder) => {
    const cfg        = STATUS_CFG[order.status];
    const isDelivery = order.order_type === "delivery";
    const primaryAddress = isDelivery ? order.destination_address : order.origin_address;
    const isExpanded = expanded === order.id;
    const isUpdating = updating === order.id;
    const hasOverride = !!order.scheduled_time_override;
    const displayTime = effectiveTime(order);
    const done = order.status === "completed";

    return (
      <div
        key={order.id}
        className={`p-4 rounded-[var(--radius)] border transition-all ${
          done
            ? "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-900/10"
            : order.status === "in_progress"
            ? "border-purple-200 bg-purple-50/50"
            : isDark ? "bg-[hsl(var(--card))] border-[hsl(var(--border))]" : "bg-[hsl(var(--background))] border-[hsl(var(--border))]"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            <button
              onClick={() => advanceStatus(order)}
              className="mt-1 hover:scale-110 transition-transform shrink-0"
              disabled={!cfg.next || isUpdating || done}
              title={cfg.next ? cfg.nextLabel : "Completed"}
            >
              {getStatusIcon(order)}
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h4 className={`font-semibold truncate ${done ? "line-through text-[hsl(var(--muted-foreground))]" : "text-[hsl(var(--foreground))]"}`}>
                  {order.customer_name}
                </h4>
                <Badge variant={isDelivery ? "secondary" : "outline"}>
                  {isDelivery ? "📦" : "🚛"} {isDelivery ? "Delivery" : "Pickup"}
                </Badge>
                {isUpdating && <Badge variant="secondary">Updating…</Badge>}
              </div>
              <p className={`text-sm mb-1 truncate ${done ? "text-[hsl(var(--muted-foreground))]" : "text-[hsl(var(--muted-foreground))]"}`}>
                {order.item_description}
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                {getStatusText(order)}
                {isDelivery && !done && (
                  <span className="text-xs font-bold" style={{ color: PAYMENT_COLOR[order.payment_status] ?? "#888" }}>
                    $ {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                  </span>
                )}
              </div>
              {order.item_notes && (
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 italic truncate">
                  📝 {order.item_notes}
                </p>
              )}
              {/* ETA badge from Mapbox — shown when drive time is known */}
              {order.eta_minutes !== null && !done && (
                <div className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-xs font-bold ${
                  order.eta_notified
                    ? "bg-red-100 text-red-700"
                    : "bg-amber-100 text-amber-700"
                }`}>
                  <Clock size={11} />
                  {order.eta_notified
                    ? `🚨 Leave now — ${order.eta_minutes} min drive`
                    : `~${order.eta_minutes} min drive`}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="text-xs text-[hsl(var(--muted-foreground))] whitespace-nowrap">
              {formatDeliveryDate(order.scheduled_date)}
            </span>
            {displayTime && (
              <span
                className={`text-xs font-semibold whitespace-nowrap ${hasOverride ? "text-amber-600" : done ? "text-green-600" : "text-[hsl(var(--foreground))]"}`}
                title={hasOverride ? `Original: ${formatDeliveryTime(order.scheduled_time)}` : undefined}
              >
                {hasOverride && "✏️ "}{formatDeliveryTime(displayTime)}
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

        {/* Expanded panel */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-[hsl(var(--border))] space-y-2">
            {order.customer_phone && (
              <a href={`tel:${order.customer_phone}`} className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--sidebar-primary))]">
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
              <p className="text-xs text-[hsl(var(--muted-foreground))] italic">💳 {order.payment_notes}</p>
            )}
            {isDelivery  && order.origin_address      && <DetailRow label="Pickup From" value={order.origin_address} />}
            {!isDelivery && order.destination_address && <DetailRow label="Drop Off To" value={order.destination_address} />}
            {order.taken_by && <DetailRow label="Taken By" value={order.taken_by} />}

            {/* Time adjustment */}
            {!done && (
              <div className="pt-1">
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={13} className="text-[hsl(var(--muted-foreground))]" />
                  <span className="text-xs font-semibold text-[hsl(var(--foreground))]">
                    Time{hasOverride && <span className="ml-1 text-amber-600">(adjusted from {formatDeliveryTime(order.scheduled_time)})</span>}
                  </span>
                </div>
                {editingTime === order.id ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={pendingTime}
                      onChange={(e) => setPendingTime(e.target.value)}
                      className="flex-1 px-2 py-1 text-sm border border-[hsl(var(--border))] rounded bg-[hsl(var(--input))] text-[hsl(var(--foreground))]"
                    >
                      <option value="">-- Pick new time --</option>
                      {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <button onClick={() => saveTimeOverride(order.id)} disabled={!pendingTime}
                      className={`px-2 py-1 text-xs rounded text-white transition-colors ${pendingTime ? "bg-green-600 hover:bg-green-700" : "bg-[hsl(var(--muted))] cursor-not-allowed"}`}>
                      Save
                    </button>
                    <button onClick={() => setEditingTime(null)}
                      className="px-2 py-1 text-xs rounded bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] transition-colors">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${hasOverride ? "text-amber-600" : "text-[hsl(var(--foreground))]"}`}>
                      {displayTime ? formatDeliveryTime(displayTime) : "No time set"}
                    </span>
                    <button onClick={() => { setEditingTime(order.id); setPendingTime(""); }}
                      className="px-2 py-1 text-xs rounded border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors">
                      Change
                    </button>
                    {hasOverride && (
                      <button onClick={() => clearTimeOverride(order.id)}
                        className="px-2 py-1 text-xs rounded border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] transition-colors">
                        Reset
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {cfg.next && (
              <Button onClick={() => advanceStatus(order)} disabled={isUpdating} className="w-full mt-1">
                {isUpdating ? "Updating…" : cfg.nextLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">

      {/* ── Trash Runs ─────────────────────────────────────────────────────── */}
      <div className={`rounded-lg border border-[hsl(var(--border))] overflow-hidden ${isDark ? "bg-[hsl(var(--card))]" : "bg-[hsl(var(--background))]"}`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-2">
            <Trash2 size={16} className="text-[hsl(var(--muted-foreground))]" />
            <span className="font-semibold text-sm text-[hsl(var(--foreground))]">Trash Runs</span>
            <Badge variant="secondary">{trashRuns.filter((r) => r.status === "pending").length} pending</Badge>
          </div>
          <button
            onClick={() => setShowAddTrash(true)}
            className="px-3 py-1 text-sm bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] rounded hover:bg-[hsl(var(--sidebar-primary))]/90 transition-colors flex items-center gap-1"
          >
            <Plus size={14} /> Add Run
          </button>
        </div>
        {trashRuns.length === 0 ? (
          <p className="px-4 py-3 text-sm text-[hsl(var(--muted-foreground))]">No trash runs logged.</p>
        ) : (
          <div className="divide-y divide-[hsl(var(--border))]">
            {trashRuns.map((run) => (
              <div key={run.id} className="flex items-start space-x-3 px-4 py-3">
                <button onClick={() => toggleTrashRun(run)} className="mt-0.5 hover:scale-110 transition-transform shrink-0">
                  {run.status === "done"
                    ? <CheckCircle2 size={20} className="text-green-600" />
                    : <Circle size={20} className="text-[hsl(var(--muted-foreground))]" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${run.status === "done" ? "line-through text-[hsl(var(--muted-foreground))]" : "text-[hsl(var(--foreground))]"}`}>
                    {run.note ?? "Trash run to dump"}
                  </p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                    {run.status === "done"
                      ? `✓ Done ${run.completed_at ? new Date(run.completed_at).toLocaleTimeString() : ""}`
                      : new Date(run.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Add Trash Run Modal ─────────────────────────────────────────────── */}
      {showAddTrash && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className={`w-full max-w-md rounded-lg p-6 ${isDark ? "bg-[hsl(var(--card))]" : "bg-white"}`}>
            <h4 className="text-lg font-semibold mb-4 text-[hsl(var(--foreground))]">Log Trash Run</h4>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-[hsl(var(--foreground))]">Notes (optional)</label>
              <input
                type="text"
                placeholder="e.g. 3 bags from back dock, fridge from floor"
                value={trashNote}
                onChange={(e) => setTrashNote(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleConfirmAddTrash()}
                autoFocus
                className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded bg-[hsl(var(--input))] text-[hsl(var(--foreground))]"
              />
            </div>
            <div className="flex space-x-3">
              <button onClick={() => { setShowAddTrash(false); setTrashNote(""); }}
                className="flex-1 px-4 py-2 border border-[hsl(var(--border))] rounded text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors">
                Cancel
              </button>
              <button onClick={handleConfirmAddTrash} disabled={addingTrash}
                className={`flex-1 px-4 py-2 bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] rounded hover:bg-[hsl(var(--sidebar-primary))]/90 transition-colors flex items-center justify-center gap-1 ${addingTrash ? "opacity-50 cursor-not-allowed" : ""}`}>
                <Plus size={16} /> {addingTrash ? "Adding…" : "Add Run"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Filter chips ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        {(["today", "upcoming", "all"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}>
            <Badge variant={filter === f ? "default" : "outline"}>
              {f === "today" ? "Today" : f === "upcoming" ? "Upcoming" : "All"}
            </Badge>
          </button>
        ))}
        <button onClick={fetchOrders}
          className="ml-auto p-1.5 rounded-[var(--radius)] border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] transition-colors"
          title="Refresh">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* ── Order list ─────────────────────────────────────────────────────── */}
      {loading ? (
        <p className="text-center py-12 text-sm text-[hsl(var(--muted-foreground))]">Loading orders…</p>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 flex flex-col items-center gap-2 text-[hsl(var(--muted-foreground))]">
          <span className="text-4xl">🎉</span>
          <p className="text-sm font-medium">No orders for this view.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Active orders first */}
          {activeOrders.map(renderOrder)}

          {/* Completed orders — visually separated */}
          {completedOrders.length > 0 && (
            <>
              <div className="flex items-center gap-2 pt-2">
                <div className="flex-1 h-px bg-green-200" />
                <span className="text-xs font-bold text-green-600 uppercase tracking-wider">
                  ✓ Completed ({completedOrders.length})
                </span>
                <div className="flex-1 h-px bg-green-200" />
              </div>
              {completedOrders.map(renderOrder)}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-xs">
      <span className="font-bold shrink-0 w-24 text-[hsl(var(--muted-foreground))]">{label}:</span>
      <span className="text-[hsl(var(--foreground))] break-words">{value}</span>
    </div>
  );
}