"use client";

import { Clock } from "lucide-react";
import { TIME_SLOTS } from "@/types/delivery";
import { formatDeliveryDate, formatDeliveryTime } from "@/utils/deliveryUtils";

interface ReschedulePanelProps {
  orderId:      string;
  scheduledDate: string | null;
  scheduledTime: string | null;
  hasOverride:  boolean;
  displayTime:  string | null;
  isEditing:    boolean;
  pendingDate:  string;
  pendingTime:  string;
  onStartEdit:  () => void;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  onSave:       () => void;
  onCancel:     () => void;
  onReset:      () => void;
}

/**
 * Reschedule panel — inline date + time editor for a delivery order.
 * Collapsed: shows current date · time with Change / Reset buttons.
 * Expanded:  date input + time slot select + Save / Cancel.
 */
export function ReschedulePanel({
  orderId,
  scheduledDate,
  scheduledTime,
  hasOverride,
  displayTime,
  isEditing,
  pendingDate,
  pendingTime,
  onStartEdit,
  onDateChange,
  onTimeChange,
  onSave,
  onCancel,
  onReset,
}: ReschedulePanelProps) {
  return (
    <div className="pt-1">
      <div className="flex items-center gap-2 mb-1">
        <Clock size={13} className="text-[hsl(var(--muted-foreground))]" />
        <span className="text-xs font-semibold text-[hsl(var(--foreground))]">
          Reschedule
          {hasOverride && <span className="ml-1 text-amber-600">(adjusted)</span>}
        </span>
      </div>

      {isEditing ? (
        <div className="flex flex-col gap-2">
          {/* Date */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[hsl(var(--muted-foreground))] w-10 shrink-0">Date</span>
            <input
              type="date"
              value={pendingDate || scheduledDate || ""}
              onChange={(e) => onDateChange(e.target.value)}
              className="flex-1 px-2 py-1 text-sm border border-[hsl(var(--border))] rounded bg-[hsl(var(--input))] text-[hsl(var(--foreground))]"
            />
          </div>
          {/* Time */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[hsl(var(--muted-foreground))] w-10 shrink-0">Time</span>
            <select
              value={pendingTime}
              onChange={(e) => onTimeChange(e.target.value)}
              className="flex-1 px-2 py-1 text-sm border border-[hsl(var(--border))] rounded bg-[hsl(var(--input))] text-[hsl(var(--foreground))]"
            >
              <option value="">-- Pick new time --</option>
              {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={onSave}
              disabled={!pendingTime}
              className={`flex-1 px-2 py-1.5 text-xs rounded font-semibold text-white transition-colors ${
                pendingTime ? "bg-green-600 hover:bg-green-700" : "bg-[hsl(var(--muted))] cursor-not-allowed"
              }`}
            >
              Save
            </button>
            <button
              onClick={onCancel}
              className="flex-1 px-2 py-1.5 text-xs rounded bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${hasOverride ? "text-amber-600" : "text-[hsl(var(--foreground))]"}`}>
            {scheduledDate ? formatDeliveryDate(scheduledDate) : "Date TBD"}
            {displayTime ? ` · ${formatDeliveryTime(displayTime)}` : ""}
          </span>
          <button
            onClick={onStartEdit}
            className="px-2 py-1 text-xs rounded border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors"
          >
            Change
          </button>
          {hasOverride && (
            <button
              onClick={onReset}
              className="px-2 py-1 text-xs rounded border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      )}
    </div>
  );
}