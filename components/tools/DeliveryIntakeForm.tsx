"use client";

import { createClient } from "@supabase/supabase-js";
import { useTheme } from "@/app/provider";
import IntakeForm from "@/components/delivery/IntakeForm";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DeliveryIntakeForm() {
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