"use client";

import { useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { useTheme } from "@/app/provider";
import WeatherWidget from "@/components/WeatherWidget";
import { Truck, ClipboardList } from "lucide-react";
import DriverBoard from "./DriverBoard";
import IntakeForm from "./IntakeForm";
import { DeliveryTab } from "@/types/delivery";

// Single Supabase client for the entire delivery module
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const TABS: { id: DeliveryTab; label: string; icon: React.ReactNode }[] = [
  { id: "driver", label: "Driver Board", icon: <Truck size={15} /> },
  { id: "orders", label: "New Order",    icon: <ClipboardList size={15} /> },
];

/**
 * Delivery orchestrator.
 * Owns: active tab, Supabase client, header stat counts.
 * Renders: sticky header (inline) + active sub-module.
 * Sub-modules: DriverBoard, IntakeForm — each in their own folder/index.tsx.
 */
export default function DeliveryIndex() {
  const { themeType } = useTheme();
  const isDark = themeType === "dark";

  const [activeTab, setActiveTab]       = useState<DeliveryTab>("driver");
  const [todayCount, setTodayCount]     = useState(0);
  const [upcomingCount, setUpcomingCount] = useState(0);

  const handleCountsChange = useCallback((today: number, upcoming: number) => {
    setTodayCount(today);
    setUpcomingCount(upcoming);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "hsl(var(--background))" }}>

      {/* ── Sticky header — inlined, same pattern as hero.tsx ── */}
      <div
        className="sticky top-0 z-10 border-b"
        style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
      >
        {/* Top row: title + stats + weather */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2 gap-3 flex-wrap">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "hsl(var(--muted-foreground))" }}>
              DART Thrift
            </p>
            <h1 className="text-xl font-extrabold leading-tight" style={{ color: "hsl(var(--foreground))" }}>
              Delivery &amp; Pickups
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <span className="text-xs font-bold px-2 py-1 rounded-lg"
                style={{ background: "hsl(var(--accent))", color: "hsl(var(--accent-foreground))" }}>
                {todayCount} Today
              </span>
              <span className="text-xs font-bold px-2 py-1 rounded-lg"
                style={{ background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }}>
                {upcomingCount} Upcoming
              </span>
            </div>
            <WeatherWidget />
          </div>
        </div>

        {/* Tab bar — exact same pattern as hero.tsx */}
        <nav className="flex gap-0 px-2 pb-0">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 ${
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
      <div className="max-w-2xl mx-auto px-3 pt-4 pb-16">
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