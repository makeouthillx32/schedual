// app/CMS/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CMS | DART Commercial Services",
  description: "DART Commercial Services cleaning schedule and team management.",
  manifest: "/manifest-cms.json",
};

export default function CMSLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}