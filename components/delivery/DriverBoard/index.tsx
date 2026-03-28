"use client";

import { useState, useCallback } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { Badge } from "@/components/ui/badge";
import TodayView from "@/components/delivery/views/TodayView";
import DeliveryExportButton from "@/components/delivery/_components/DeliveryExportButton";
import WeekView  from "@/components/delivery/views/WeekView";
import AllView   from "@/components/delivery/views/AllView";

type Tab = "today" | "week" | "all";

interface DriverBoardProps {
  supabase:       SupabaseClient;
  isDark:         boolean;
  onCountsChange: (today: number, upcoming: number) => void;
}

const TABS: { id: Tab; label: string }[] = [
  { id: "today", label: "Today"  },
  { id: "week",  label: "Week"   },
  { id: "all",   label: "All"    },
];

export default function DriverBoard({ supabase, isDark, onCountsChange }: DriverBoardProps) {
  const [tab, setTab] = useState<Tab>("today");

  // Stable callback so each view doesn't re-render on tab switch
  const handleCounts = useCallback(onCountsChange, [onCountsChange]);

  const viewProps = { supabase, isDark, onCountsChange: handleCounts };

  return (
    <div className="space-y-4">
      {/* Tab bar + export */}
      <div className="flex items-center gap-2">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}>
            <Badge variant={tab === t.id ? "default" : "outline"}>
              {t.label}
            </Badge>
          </button>
        ))}
        <div className="ml-auto">
          <DeliveryExportButton supabase={supabase} />
        </div>
      </div>

      {/* Active view — each mounts/unmounts independently */}
      {tab === "today" && <TodayView {...viewProps} />}
      {tab === "week"  && <WeekView  {...viewProps} />}
      {tab === "all"   && <AllView   {...viewProps} />}
    </div>
  );
}