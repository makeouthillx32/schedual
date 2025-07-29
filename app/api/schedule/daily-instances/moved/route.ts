// app/api/schedule/daily-instances/moved/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET - Check for businesses moved to today's date
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date"); // YYYY-MM-DD format

  if (!date) {
    return NextResponse.json(
      { error: "Missing required parameter: date" },
      { status: 400 }
    );
  }

  try {
    console.log("🔍 Checking for businesses moved to date:", date);

    // Find all businesses that were moved to this specific date
    const { data: movedItems, error: movedError } = await supabase
      .from("daily_clean_items")
      .select(`
        *,
        daily_clean_instances!inner (
          instance_date,
          day_name,
          week_number
        )
      `)
      .eq("status", "moved")
      .eq("moved_to_date", date);

    if (movedError) {
      console.error("Error fetching moved items:", movedError);
      return NextResponse.json({ error: movedError.message }, { status: 500 });
    }

    if (!movedItems || movedItems.length === 0) {
      console.log("📋 No businesses moved to", date);
      return NextResponse.json({ movedBusinesses: [] });
    }

    console.log("📦 Found", movedItems.length, "businesses moved to", date);

    // Transform moved items to match CleanTrackItem format
    const movedBusinesses = movedItems.map((item: any) => ({
      id: item.id,
      business_id: item.business_id,
      business_name: item.business_name,
      address: item.address,
      before_open: item.before_open,
      status: "pending", // Reset to pending when moved to new day
      notes: `Moved from ${item.daily_clean_instances.day_name}`,
      original_date: item.daily_clean_instances.instance_date,
      moved_from: item.daily_clean_instances.day_name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    console.log("✅ Transformed moved businesses:", movedBusinesses);

    return NextResponse.json({ movedBusinesses });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}