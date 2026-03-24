import type { PropsWithChildren } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Delivery & Pickups | DART Thrift",
  description: "Schedule deliveries and pickups for DART Thrift. Cashiers take orders, drivers see their board.",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9fafb" },
    { media: "(prefers-color-scheme: dark)", color: "#111827" },
  ],
};

export default function DeliveryLayout({ children }: PropsWithChildren) {
  return (
    <div className="cms-public-layout">
      {children}
    </div>
  );
}