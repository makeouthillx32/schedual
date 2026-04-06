// app/Delivery/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Delivery & Pickups | DART Thrift",
  description: "DART Thrift delivery and pickup driver board.",
  manifest: "/manifest-delivery.json",
};

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}