import type { PropsWithChildren } from "react";
import { Sidebar } from "@/components/Layouts/sidebar";
import { Header } from "@/components/Layouts/header";

export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <Header />
        <main className="mx-auto w-full max-w-screen-2xl p-4 md:p-6 2xl:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}