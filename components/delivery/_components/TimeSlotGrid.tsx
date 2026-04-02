// components/delivery/_components/TimeSlotGrid.tsx
"use client";

import { AlertCircle } from "lucide-react";
import { Label }       from "@/components/ui/label";
import { cn }          from "@/lib/utils";
import { SlotGridSkeleton } from "@/components/delivery/_components/skeleton";
import { minutesToLabel, pgTimeToMinutes } from "@/components/delivery/_components/utils";
import type { SlotMeta, DateOption, ExistingOrder } from "@/components/delivery/_components/types";

// ── Date strip ────────────────────────────────────────────────────────────────

interface DateStripProps {
  dates:        DateOption[];
  selectedDate: string;
  onSelectDate: (value: string) => void;
}

export function DateStrip({ dates, selectedDate, onSelectDate }: DateStripProps) {
  return (
    <div>
      <Label className="text-sm font-semibold mb-2 block">Date</Label>
      <div className="flex gap-2 overflow-x-auto pb-2 snap-x" style={{ scrollbarWidth: "none" }}>
        {dates.map((d) => {
          const active = selectedDate === d.value;
          return (
            <button
              key={d.value}
              onClick={() => onSelectDate(active ? "" : d.value)}
              className={cn(
                "flex-shrink-0 snap-start flex flex-col items-center gap-0.5 w-14 py-2.5 rounded-2xl border-2 transition-all active:scale-95",
                d.isWeekend && !active ? "opacity-50" : "",
                active
                  ? "border-[hsl(var(--sidebar-primary))] bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]"
                  : "border-border bg-background text-foreground hover:border-[hsl(var(--sidebar-primary))]",
              )}
            >
              <span className="text-[10px] font-semibold uppercase">{d.dayName}</span>
              <span className="text-lg font-bold leading-tight">{d.dayNum}</span>
              <span className="text-[10px]">{d.monthShort}</span>
              {d.isToday && (
                <span className={cn(
                  "text-[9px] font-bold",
                  active ? "text-white/80" : "text-[hsl(var(--sidebar-primary))]",
                )}>
                  Today
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Slot grid ─────────────────────────────────────────────────────────────────

interface SlotGridProps {
  slots:        SlotMeta[];
  selectedTime: string;
  loading:      boolean;
  onSelect:     (label: string) => void;
  selectedDate: string;
}

export function SlotGrid({ slots, selectedTime, loading, onSelect, selectedDate }: SlotGridProps) {
  if (loading) return <SlotGridSkeleton />;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <Label className="text-sm font-semibold">
          Time Slots —{" "}
          <span className="font-normal text-muted-foreground">
            {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
              weekday: "long", month: "short", day: "numeric",
            })}
          </span>
        </Label>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-3 text-xs text-muted-foreground">
        {[
          { color: "bg-[hsl(var(--sidebar-primary))]",                          label: "Selected" },
          { color: "border-2 border-border bg-background",                      label: "Open"     },
          { color: "bg-red-100 border border-red-300 dark:bg-red-900/20",       label: "Booked"   },
          { color: "bg-muted",                                                   label: "Break"    },
        ].map((l) => (
          <span key={l.label} className="flex items-center gap-1.5">
            <span className={cn("w-3 h-3 rounded-sm", l.color)} />
            {l.label}
          </span>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-2">
        {slots.map((slot) => {
          const active  = selectedTime === slot.label;
          const taken   = !slot.blocked && slot.orders.length > 0;
          // Hard-disable: blocked by break/lunch OR already has an order
          const disabled = slot.blocked || taken;

          const tooltip = slot.blocked
            ? `${slot.blockLabel} — unavailable`
            : taken
            ? `Booked: ${slot.orders.map((o) => o.customer_name).join(", ")}`
            : undefined;

          return (
            <div key={slot.label} className="relative">
              <button
                disabled={disabled}
                onClick={() => !disabled && onSelect(active ? "" : slot.label)}
                title={tooltip}
                className={cn(
                  "w-full py-2.5 px-1 rounded-xl border-2 text-xs font-semibold transition-all active:scale-95 flex flex-col items-center gap-0.5",
                  slot.blocked
                    ? "bg-muted border-muted text-muted-foreground cursor-not-allowed opacity-50"
                    : taken
                    ? "bg-red-50 border-red-300 text-red-700 cursor-not-allowed opacity-70 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700"
                    : active
                    ? "bg-[hsl(var(--sidebar-primary))] border-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]"
                    : "bg-background border-border text-foreground hover:border-[hsl(var(--sidebar-primary))]",
                )}
              >
                <span>{slot.blocked ? "—" : slot.label}</span>
                {slot.blocked && (
                  <span className="text-[9px] leading-tight text-center px-0.5">
                    {slot.blockLabel}
                  </span>
                )}
                {taken && (
                  <span className="text-[9px] leading-tight font-normal truncate w-full text-center px-0.5">
                    {slot.orders[0].customer_name.split(" ")[0]}
                  </span>
                )}
              </button>

              {/* Red dot on taken slots */}
              {taken && (
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border-2 border-background" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Existing orders panel ─────────────────────────────────────────────────────

interface OrdersPanelProps {
  orders: ExistingOrder[];
}

export function ExistingOrdersPanel({ orders }: OrdersPanelProps) {
  if (orders.length === 0) return null;

  return (
    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800 p-3">
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />
        <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
          {orders.length} order{orders.length > 1 ? "s" : ""} already scheduled this day
        </span>
      </div>
      <div className="space-y-1">
        {orders.map((o) => {
          const effectiveTime = o.scheduled_time_override ?? o.scheduled_time;
          const rescheduled   = !!o.scheduled_time_override;
          return (
            <div key={o.id} className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-400">
              <span className="font-medium">
                {o.order_type === "pickup" ? "🚛" : "📦"} {o.customer_name}
              </span>
              <span className="font-mono text-amber-600 dark:text-amber-500 flex items-center gap-1">
                {rescheduled && <span title="Rescheduled">✏️</span>}
                {minutesToLabel(pgTimeToMinutes(effectiveTime))}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}