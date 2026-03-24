"use client";

import { useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { useTheme } from "@/app/provider";
import WeatherWidget from "@/components/WeatherWidget";
import { Truck, ClipboardList } from "lucide-react";
import DriverBoard from "./DriverBoard";
import IntakeForm from "./IntakeForm";
import { DeliveryTab } from "@/types/delivery";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const TABS: { id: DeliveryTab; label: string; icon: React.ReactNode }[] = [
  { id: "driver", label: "Driver Board", icon: <Truck size={15} /> },
  { id: "orders", label: "New Order",    icon: <ClipboardList size={15} /> },
];

export default function DeliveryIndex() {
  const { themeType } = useTheme();
  const isDark = themeType === "dark";

  const [activeTab, setActiveTab]         = useState<DeliveryTab>("driver");
  const [todayCount, setTodayCount]       = useState(0);
  const [upcomingCount, setUpcomingCount] = useState(0);

  const handleCountsChange = useCallback((today: number, upcoming: number) => {
    setTodayCount(today);
    setUpcomingCount(upcoming);
  }, []);

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden"
      style={{ background: "hsl(var(--background))" }}
    >
      {/* ── Sticky header ── */}
      <div
        className="sticky top-0 z-10 border-b w-full"
        style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
      >
        {/* Top row */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2 gap-2 min-w-0">
          <div className="min-w-0">
            <p
              className="text-xs font-semibold tracking-widest uppercase truncate"
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              DART Thrift
            </p>
            <h1
              className="text-lg font-extrabold leading-tight truncate"
              style={{ color: "hsl(var(--foreground))" }}
            >
              Delivery &amp; Pickups
            </h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className="text-xs font-bold px-2 py-1 rounded-lg whitespace-nowrap"
              style={{ background: "hsl(var(--accent))", color: "hsl(var(--accent-foreground))" }}
            >
              {todayCount} Today
            </span>
            <span
              className="text-xs font-bold px-2 py-1 rounded-lg whitespace-nowrap hidden sm:inline"
              style={{ background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }}
            >
              {upcomingCount} Upcoming
            </span>
            <WeatherWidget />
          </div>
        </div>

        {/* Tab bar */}
        <nav className="flex px-2 pb-0 overflow-x-auto">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 shrink-0 ${
                  isActive
                    ? "text-[hsl(var(--sidebar-primary))] border-[hsl(var(--sidebar-primary))]"
                    : "text-[hsl(var(--muted-foreground))] border-transparent hover:text-[hsl(var(--foreground))]"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Tab content ── */}
      <div className="w-full max-w-2xl mx-auto px-3 pt-4 pb-16">
        {activeTab === "driver" && (
          <DriverBoard
            supabase={supabase}
            isDark={isDark}
            onCountsChange={handleCountsChange}
          />
        )}
        {activeTab === "orders" && (
          <IntakeForm
            supabase={supabase}
            isDark={isDark}
          />
        )}
      </div>
    </div>
  );
}