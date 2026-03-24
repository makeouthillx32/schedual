"use client";

import { createClient } from "@supabase/supabase-js";
import { useTheme } from "@/app/provider";
import MetaThemeColor from "@/components/MetaThemeColor";
import IntakeForm from "@/components/delivery/IntakeForm";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DeliveryIntakeForm() {
  const { themeType } = useTheme();
  const isDark = themeType === "dark";

  return (
    <>
      <MetaThemeColor type="app" />
      <div className="min-h-screen" style={{ background: "hsl(var(--background))" }}>

        {/* Header */}
        <div
          className="sticky top-0 z-10 border-b px-4 pt-3 pb-3"
          style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
        >
          <p
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            DART Thrift
          </p>
          <h1
            className="text-xl font-extrabold leading-tight"
            style={{ color: "hsl(var(--foreground))" }}
          >
            Schedule a Delivery or Pickup
          </h1>
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto px-3 pt-4 pb-16">
          <IntakeForm supabase={supabase} isDark={isDark} />
        </div>

      </div>
    </>
  );
}