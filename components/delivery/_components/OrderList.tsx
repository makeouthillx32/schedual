"use client";

import { DeliveryOrder } from "@/types/delivery";
import { OrderCard } from "@/components/delivery/_components/OrderCard";

// Matches exactly what useOrderActions.cardProps returns + isDark from the view
type CardPropsResult = Omit<
  React.ComponentProps<typeof OrderCard>,
  "order" | "isDark"
>;

interface OrderListProps {
  orders:    DeliveryOrder[];
  loading:   boolean;
  isDark:    boolean;
  cardProps: (order: DeliveryOrder) => CardPropsResult;
}

/**
 * Shared order list renderer — active orders first, completed below a divider.
 * Used by TodayView, WeekView, and AllView.
 */
export function OrderList({ orders, loading, isDark, cardProps }: OrderListProps) {
  if (loading) {
    return (
      <p className="text-center py-12 text-sm text-[hsl(var(--muted-foreground))]">
        Loading orders…
      </p>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 flex flex-col items-center gap-2 text-[hsl(var(--muted-foreground))]">
        <span className="text-4xl">🎉</span>
        <p className="text-sm font-medium">No orders for this view.</p>
      </div>
    );
  }

  const active    = orders.filter((o) => o.status !== "completed");
  const completed = orders.filter((o) => o.status === "completed");

  return (
    <div className="space-y-3">
      {active.map((o) => (
        <OrderCard key={o.id} order={o} isDark={isDark} {...cardProps(o)} />
      ))}

      {completed.length > 0 && (
        <>
          <div className="flex items-center gap-2 pt-2">
            <div className="flex-1 h-px bg-green-200" />
            <span className="text-xs font-bold text-green-600 uppercase tracking-wider">
              ✓ Completed ({completed.length})
            </span>
            <div className="flex-1 h-px bg-green-200" />
          </div>
          {completed.map((o) => (
            <OrderCard key={o.id} order={o} isDark={isDark} {...cardProps(o)} />
          ))}
        </>
      )}
    </div>
  );
}