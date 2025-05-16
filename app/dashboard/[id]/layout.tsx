// app/dashboard/[id]/layout.tsx
"use client";

import "@/css/satoshi.css";
import "@/css/style.css";

import { Sidebar } from "@/components/Layouts/sidebar";
import { Header } from "@/components/Layouts/header";
import { Providers } from "./providers";

import "flatpickr/dist/flatpickr.min.css";
import "jsvectormap/dist/jsvectormap.css";

import NextTopLoader from "nextjs-toploader";
import type { PropsWithChildren } from "react";
import { useState, useEffect } from "react";
import SwitchtoDarkMode from "@/components/SwitchtoDarkMode";
import { ThemeToggleSwitch } from "@/components/Layouts/header/theme-toggle";

export default function DashboardLayout({ children }: PropsWithChildren) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return (
    <Providers>
      <NextTopLoader color="#5750F1" showSpinner={false} />
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="w-full bg-gray-2 dark:bg-[#020d1a]">
          <Header />
          <main className="isolate mx-auto w-full max-w-screen-2xl overflow-hidden p-4 md:p-6 2xl:p-10">
            {/* Mobile theme switch */}
            {isMobile && (
              <div className="fixed bottom-4 right-4 z-50">
                <SwitchtoDarkMode />
              </div>
            )}
            {children}
          </main>
        </div>
      </div>
    </Providers>
  );
}