import type { PropsWithChildren } from "next/dist/shared/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Delivery & Pickups | DART Thrift",
  description: "DART Thrift delivery and pickup driver board.",
  manifest: "/manifest-delivery.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DART Delivery",
  },
};

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}