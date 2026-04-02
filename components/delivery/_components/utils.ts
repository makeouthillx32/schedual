// components/delivery/_components/utils.ts
import type { ScheduleBlock, ExistingOrder, SlotMeta, DateOption } from "@/components/delivery/_components/types";

// ── Time math ─────────────────────────────────────────────────────────────────

/** "9:30 AM" → minutes since midnight */
export function labelToMinutes(label: string): number {
  const [time, mod] = label.split(" ");
  let [h, m] = time.split(":").map(Number);
  if (mod === "PM" && h !== 12) h += 12;
  if (mod === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

/** "09:30:00" (postgres time) → minutes since midnight */
export function pgTimeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

/** minutes since midnight → "9:30 AM" */
export function minutesToLabel(mins: number): string {
  const h24  = Math.floor(mins / 60);
  const m    = mins % 60;
  const ampm = h24 >= 12 ? "PM" : "AM";
  const h12  = h24 % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

// ── Slot building ─────────────────────────────────────────────────────────────

/**
 * Annotates each TIME_SLOT label with:
 *   - blocked    → slot falls inside an active break/lunch window
 *   - orders     → existing orders at EXACTLY this slot time
 *   - available  → not blocked AND no orders at this exact time
 *
 * NOTE: We match orders by exact time (not a ±30 min window) so that
 * only the specific slot that is already booked shows as taken.
 */
export function buildSlots(
  slots:  string[],
  blocks: ScheduleBlock[],
  orders: ExistingOrder[],
): SlotMeta[] {
  return slots.map((label) => {
    const slotMins = labelToMinutes(label);

    // Blocked if the slot falls inside any active break/lunch window
    const matchBlock = blocks.find((b) => {
      if (!b.is_active) return false;
      const start = pgTimeToMinutes(b.start_time);
      const end   = pgTimeToMinutes(b.end_time);
      return slotMins >= start && slotMins < end;
    });

    // Orders that are scheduled at exactly this slot time
    const slotOrders = orders.filter((o) => {
      const effectiveTime = o.scheduled_time_override ?? o.scheduled_time;
      return pgTimeToMinutes(effectiveTime) === slotMins;
    });

    return {
      label,
      blocked:    !!matchBlock,
      blockLabel: matchBlock?.label,
      orders:     slotOrders,
      available:  !matchBlock && slotOrders.length === 0,
    };
  });
}

// ── Date generation ───────────────────────────────────────────────────────────

/** Returns the next `days` dates in Pacific Time */
export function getUpcomingDates(days = 21): DateOption[] {
  const result: DateOption[] = [];
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  );
  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    result.push({
      value:      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      dayName:    d.toLocaleDateString("en-US", { weekday: "short" }),
      dayNum:     d.getDate(),
      monthShort: d.toLocaleDateString("en-US", { month: "short" }),
      isToday:    i === 0,
      isWeekend:  d.getDay() === 0 || d.getDay() === 6,
    });
  }
  return result;
}