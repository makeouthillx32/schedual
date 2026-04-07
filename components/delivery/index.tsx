"use client";

import { useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { useTheme } from "@/app/provider";
import WeatherWidget from "@/components/WeatherWidget";
import DriverBoard from "./DriverBoard";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DeliveryIndex() {
  const { themeType } = useTheme();
  const isDark = themeType === "dark";

  const [todayCount, setTodayCount]       = useState(0);
  const [upcomingCount, setUpcomingCount] = useState(0);

  const handleCountsChange = useCallback((today: number, upcoming: number) => {
    setTodayCount(today);
    setUpcomingCount(upcoming);
  }, []);

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden"
      style={{ background: "var(--gp-bg)" }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-10 border-b w-full"
        style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
      >
        <div className="flex items-center justify-between px-4 pt-3 pb-3 gap-2 min-w-0">
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
              {upcomingCount} Up
            </span>
            <WeatherWidget />
          </div>
        </div>
      </div>

      {/* Driver board — the whole page */}
      <div className="w-full max-w-2xl mx-auto px-3 pt-4 pb-16">
        <DriverBoard
          supabase={supabase}
          isDark={isDark}
          onCountsChange={handleCountsChange}
        />
      </div>
    </div>
  );
}