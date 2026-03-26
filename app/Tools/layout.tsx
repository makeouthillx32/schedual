import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tools | DART",
  description: "DART staff tools — delivery intake and more.",
  manifest: "/manifest-tools.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DART Tools",
  },
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}