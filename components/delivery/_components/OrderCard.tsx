"use client";

import { Clock, CheckCircle2, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeliveryOrder, STATUS_CFG, PAYMENT_COLOR } from "@/types/delivery";
import { formatDeliveryDate, formatDeliveryTime } from "@/utils/deliveryUtils";
import { QuickContact } from "./QuickContact";
import { MapPicker } from "./MapPicker";
import { DetailRow } from "./DetailRow";
import { ReschedulePanel } from "./ReschedulePanel";

interface OrderCardProps {
  order:        DeliveryOrder;
  isDark:       boolean;
  isExpanded:   boolean;
  isUpdating:   boolean;
  isEditing:    boolean;
  pendingDate:  string;
  pendingTime:  string;
  onToggleExpand:  () => void;
  onAdvanceStatus: () => void;
  onStartEdit:     () => void;
  onDateChange:    (date: string) => void;
  onTimeChange:    (time: string) => void;
  onSave:          () => void;
  onCancelEdit:    () => void;
  onReset:         () => void;
}

function getStatusIcon(order: DeliveryOrder) {
  switch (order.status) {
    case "completed":   return <CheckCircle2 size={20} className="text-green-600" />;
    case "in_progress": return <span className="text-xl">🔄</span>;
    case "assigned":    return <span className="text-xl">📋</span>;
    default:            return <Circle size={20} className="text-[hsl(var(--muted-foreground))]" />;
  }
}

function getStatusText(order: DeliveryOrder) {
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
}

export function OrderCard({
  order,
  isDark,
  isExpanded,
  isUpdating,
  isEditing,
  pendingDate,
  pendingTime,
  onToggleExpand,
  onAdvanceStatus,
  onStartEdit,
  onDateChange,
  onTimeChange,
  onSave,
  onCancelEdit,
  onReset,
}: OrderCardProps) {
  const cfg          = STATUS_CFG[order.status];
  const isDelivery   = order.order_type === "delivery";
  const primaryAddr  = isDelivery ? order.destination_address : order.origin_address;
  const hasOverride  = !!order.scheduled_time_override;
  const displayTime  = order.scheduled_time_override ?? order.scheduled_time;
  const done         = order.status === "completed";

  return (
    <div
      className={`p-4 rounded-[var(--radius)] border transition-all ${
        done
          ? "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-900/10"
          : order.status === "in_progress"
          ? "border-purple-200 bg-purple-50/50"
          : isDark
          ? "bg-[hsl(var(--card))] border-[hsl(var(--border))]"
          : "bg-[hsl(var(--background))] border-[hsl(var(--border))]"
      }`}
    >
      {/* ── Top row ── */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <button
            onClick={onAdvanceStatus}
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

            <p className="text-sm mb-1 truncate text-[hsl(var(--muted-foreground))]">
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

            {/* ETA badge */}
            {order.eta_minutes !== null && !done && (
              <div className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-xs font-bold ${
                order.eta_notified ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
              }`}>
                <Clock size={11} />
                {order.eta_notified
                  ? `🚨 Leave now — ${order.eta_minutes} min drive`
                  : `~${order.eta_minutes} min drive`}
              </div>
            )}
          </div>
        </div>

        {/* Date / time / expand */}
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
            onClick={onToggleExpand}
            className="text-xs px-2 py-0.5 rounded border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] transition-colors"
          >
            {isExpanded ? "▲" : "▼"}
          </button>
        </div>
      </div>

      {/* ── Expanded panel ── */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-[hsl(var(--border))] space-y-3">

          {order.customer_phone && (
            <QuickContact
              phone={order.customer_phone}
              name={order.customer_name}
              address={primaryAddr}
              scheduledTime={displayTime ? formatDeliveryTime(displayTime) : undefined}
              orderType={order.order_type}
            />
          )}

          {!order.customer_phone && primaryAddr && (
            <MapPicker address={primaryAddr} />
          )}

          {isDelivery && order.payment_notes && (
            <p className="text-xs text-[hsl(var(--muted-foreground))] italic">💳 {order.payment_notes}</p>
          )}
          {isDelivery  && order.origin_address      && <DetailRow label="Pickup From" value={order.origin_address} />}
          {!isDelivery && order.destination_address && <DetailRow label="Drop Off To" value={order.destination_address} />}
          {order.taken_by && <DetailRow label="Taken By" value={order.taken_by} />}

          {!done && (
            <ReschedulePanel
              orderId={order.id}
              scheduledDate={order.scheduled_date}
              scheduledTime={order.scheduled_time}
              hasOverride={hasOverride}
              displayTime={displayTime}
              isEditing={isEditing}
              pendingDate={pendingDate}
              pendingTime={pendingTime}
              onStartEdit={onStartEdit}
              onDateChange={onDateChange}
              onTimeChange={onTimeChange}
              onSave={onSave}
              onCancel={onCancelEdit}
              onReset={onReset}
            />
          )}

          {cfg.next && (
            <Button onClick={onAdvanceStatus} disabled={isUpdating} className="w-full mt-1">
              {isUpdating ? "Updating…" : cfg.nextLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}