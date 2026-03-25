"use client";

import { useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { useTheme } from "@/app/provider";
import IntakeForm from "@/components/delivery/IntakeForm";

export default function DeliveryIntakeForm() {
  // Create inside the component — never at module level on Vercel
  const supabase = useMemo(() => createClient(), []);
  const { themeType } = useTheme();
  const isDark = themeType === "dark";

  return (
    <div
      className="min-h-screen"
      style={{ background: "hsl(var(--background))" }}
    >
      <div className="max-w-2xl mx-auto px-3 pt-4 pb-16">
        <IntakeForm supabase={supabase} isDark={isDark} />
      </div>
    </div>
  );
}