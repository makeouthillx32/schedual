// app/dashboard/[id]/providers.tsx
"use client";

import { SidebarProvider } from "@/components/Layouts/sidebar/sidebar-context";
import { Providers as GlobalProviders } from "@/app/provider"; // your full app provider

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GlobalProviders>
      <SidebarProvider>{children}</SidebarProvider>
    </GlobalProviders>
  );
}