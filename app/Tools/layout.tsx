// app/Tools/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tools | DART",
  description: "DART staff tools — delivery intake and more.",
  manifest: "/manifest-tools.json",
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}