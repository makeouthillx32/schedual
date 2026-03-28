"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { RefreshCw } from "lucide-react";
import { DeliveryOrder, STATUS_CFG } from "@/types/delivery";
import { getLocalDate, formatDeliveryTime } from "@/utils/deliveryUtils";
import { useOrderActions } from "@/components/delivery/_components/useOrderActions";
import { OrderCard } from "@/components/delivery/_components/OrderCard";

interface AllViewProps {
  supabase:       SupabaseClient;
  isDark:         boolean;
  onCountsChange: (today: number, upcoming: number) => void;
}

// ── Date helpers ──────────────────────────────────────────────────────────────

/** Generate `count` days starting from today (Pacific Time) */
function generateDays(count = 28) {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return {
      value,
      month:   d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
      dayNum:  d.getDate(),
      dayName: d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
    };
  });
}

const DAYS = generateDays(28);

// ── Row component — the flat list item ───────────────────────────────────────

interface OrderRowProps {
  order:      DeliveryOrder;
  isDark:     boolean;
  isExpanded: boolean;
  isLast:     boolean;
  cardProps:  (o: DeliveryOrder) => object;
}

function OrderRow({ order, isDark, isExpanded, isLast, cardProps }: OrderRowProps) {
  const effectiveTime = order.scheduled_time_override ?? order.scheduled_time;
  const isDelivery    = order.order_type === "delivery";
  const done          = order.status === "completed";

  // Get expand toggle from cardProps
  const props = cardProps(order) as any;

  return (
    <div>
      {/* Row tap target */}
      <button
        onClick={props.onToggleExpand}
        className={`w-full flex items-center gap-4 px-4 py-3.5 text-left transition-colors active:bg-[hsl(var(--accent))] ${
          isExpanded ? "bg-[hsl(var(--accent)/0.5)]" : "bg-transparent"
        }`}
      >
        {/* Type icon pill */}
        <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${
          done
            ? "bg-green-100 dark:bg-green-900/30"
            : isDelivery
            ? "bg-[hsl(var(--secondary)/0.15)]"
            : "bg-[hsl(var(--primary)/0.1)]"
        }`}>
          {done ? "✓" : isDelivery ? "📦" : "🚛"}
        </div>

        {/* Text block */}
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm leading-tight truncate ${
            done ? "line-through text-[hsl(var(--muted-foreground))]" : "text-[hsl(var(--foreground))]"
          }`}>
            {order.customer_name}
          </p>
          {effectiveTime && (
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
              {formatDeliveryTime(effectiveTime)}
              {order.scheduled_time_override && (
                <span className="ml-1 text-amber-500">✏️</span>
              )}
            </p>
          )}
          <p className="text-xs text-[hsl(var(--muted-foreground))] truncate mt-0.5">
            {isDelivery ? "Delivery" : "Pickup"} · {order.item_description}
          </p>
        </div>

        {/* Status dot */}
        <div className={`shrink-0 w-2 h-2 rounded-full ${
          done                          ? "bg-green-500" :
          order.status === "in_progress"? "bg-purple-500" :
          order.status === "assigned"   ? "bg-blue-500"   :
                                          "bg-[hsl(var(--muted-foreground)/0.4)]"
        }`} />
      </button>

      {/* Expanded panel — reuses existing OrderCard but hidden trigger */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-[hsl(var(--border))]">
          <div className="pt-3 space-y-3">
            {/* We render the full expanded content from OrderCard by passing a dummy outer */}
            <_ExpandedContent order={order} isDark={isDark} cardProps={cardProps} />
          </div>
        </div>
      )}

      {/* Row divider */}
      {!isLast && !isExpanded && (
        <div className="mx-4 h-px bg-[hsl(var(--border))]" />
      )}
    </div>
  );
}

/**
 * Renders just the expanded panel content by wrapping OrderCard
 * with isExpanded=true and a no-op onToggleExpand.
 */
function _ExpandedContent({ order, isDark, cardProps }: {
  order: DeliveryOrder;
  isDark: boolean;
  cardProps: (o: DeliveryOrder) => object;
}) {
  const props = cardProps(order) as any;

  return (
    <OrderCard
      {...props}
      isDark={isDark}
      isExpanded={true}
      // Override toggle so clicking advance/actions inside doesn't close
      onToggleExpand={() => {}}
    />
  );
}

// ── AllView ───────────────────────────────────────────────────────────────────

export default function AllView({ supabase, isDark, onCountsChange }: AllViewProps) {
  const today = getLocalDate();

  const [orders,      setOrders]      = useState<DeliveryOrder[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [selectedDay, setSelectedDay] = useState(today);

  const { cardProps } = useOrderActions(supabase, orders, setOrders);

  // Scroll the date strip to keep selected day centered
  const stripRef    = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

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

  // Scroll selected day into view when it changes
  useEffect(() => {
    if (selectedRef.current && stripRef.current) {
      selectedRef.current.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [selectedDay]);

  // Orders for the selected day
  const dayOrders = orders.filter((o) => o.scheduled_date === selectedDay);

  // Days that have orders — for the dot indicator
  const daysWithOrders = new Set(orders.map((o) => o.scheduled_date).filter(Boolean));

  return (
    <div className="space-y-0">

      {/* ── Date strip ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-0 pb-2">
        <div /> {/* spacer */}
        <button
          onClick={fetchOrders}
          className="p-1.5 rounded-[var(--radius)] border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] transition-colors"
          title="Refresh"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      <div
        ref={stripRef}
        className="flex gap-2 overflow-x-auto pb-3 snap-x scroll-smooth"
        style={{ scrollbarWidth: "none" }}
      >
        {DAYS.map((d) => {
          const isSelected = d.value === selectedDay;
          const isToday    = d.value === today;
          const hasOrders  = daysWithOrders.has(d.value);

          return (
            <button
              key={d.value}
              ref={isSelected ? selectedRef : undefined}
              onClick={() => setSelectedDay(d.value)}
              className={`snap-center flex-shrink-0 flex flex-col items-center gap-0.5 w-14 py-2.5 rounded-2xl border-2 transition-all active:scale-95 relative ${
                isSelected
                  ? "border-[hsl(var(--sidebar-primary))] bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]"
                  : "border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--sidebar-primary))]"
              }`}
            >
              <span className={`text-[10px] font-semibold ${isSelected ? "opacity-80" : "text-[hsl(var(--muted-foreground))]"}`}>
                {d.month}
              </span>
              <span className="text-lg font-bold leading-tight">{d.dayNum}</span>
              <span className={`text-[10px] font-medium ${isSelected ? "opacity-80" : "text-[hsl(var(--muted-foreground))]"}`}>
                {d.dayName}
              </span>
              {isToday && !isSelected && (
                <span className="text-[8px] font-bold text-[hsl(var(--sidebar-primary))]">TODAY</span>
              )}
              {/* Order indicator dot */}
              {hasOrders && (
                <span className={`absolute bottom-1.5 w-1.5 h-1.5 rounded-full ${
                  isSelected ? "bg-white/70" : "bg-[hsl(var(--sidebar-primary))]"
                }`} />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Day header ─────────────────────────────────────────────────────── */}
      <div className="px-1 py-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
          {new Date(selectedDay + "T00:00:00").toLocaleDateString("en-US", {
            weekday: "long", month: "long", day: "numeric"
          })}
        </span>
        <span className="text-xs text-[hsl(var(--muted-foreground))]">
          {dayOrders.length} order{dayOrders.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Order list ─────────────────────────────────────────────────────── */}
      {loading ? (
        <p className="text-center py-12 text-sm text-[hsl(var(--muted-foreground))]">Loading…</p>
      ) : dayOrders.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center gap-2 text-[hsl(var(--muted-foreground))]">
          <span className="text-4xl">📅</span>
          <p className="text-sm font-medium">Nothing scheduled</p>
        </div>
      ) : (
        <div className={`rounded-xl border border-[hsl(var(--border))] overflow-hidden ${
          isDark ? "bg-[hsl(var(--card))]" : "bg-[hsl(var(--background))]"
        }`}>
          {dayOrders.map((order, i) => (
            <OrderRow
              key={order.id}
              order={order}
              isDark={isDark}
              isExpanded={(cardProps(order) as any).isExpanded}
              isLast={i === dayOrders.length - 1}
              cardProps={cardProps}
            />
          ))}
        </div>
      )}
    </div>
  );
}