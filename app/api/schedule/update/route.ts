import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// ---------- READ ----------
// GET ?business_id=<id>  ➜  returns the full 4‑week schedule for that business
export async function GET (req: Request) {
  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get("business_id");

  if (!businessId) {
    return NextResponse.json({ error: "Missing business_id" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("Schedule")
    .select("id, week, monday, tuesday, wednesday, thursday, friday")
    .eq("business_id", businessId)
    .order("week");

  if (error) {
    console.error("Supabase GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// ---------- BULK WRITE ----------
// PUT body ➜ [ { id, monday, tuesday, wednesday, thursday, friday } , ... ]  (one entry per week)
export async function PUT (req: Request) {
  try {
    const updates = await req.json();

    if (!Array.isArray(updates)) {
      return NextResponse.json({ error: "Expected array of schedule updates" }, { status: 400 });
    }

    for (const entry of updates) {
      const { id, ...dayData } = entry;

      const { error } = await supabase
        .from("Schedule")
        .update(dayData)
        .eq("id", id);

      if (error) {
        console.error("Update failed for id", id, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PUT handler error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ---------- SINGLE‑DAY MOVE ----------
// POST body ➜ { business_id, week, currentDay, newDay }
//   • sets currentDay to false and newDay to true for the given business/week
//   • keeps the older endpoint behaviour so existing clients don’t break
export async function POST (req: Request) {
  try {
    const { business_id, week, currentDay, newDay } = await req.json();

    if (!business_id || !week || !currentDay || !newDay) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Clear the current day
    const { error: clearError } = await supabase
      .from("Schedule")
      .update({ [currentDay]: false })
      .eq("business_id", business_id)
      .eq("week", week);

    if (clearError) {
      console.error("Error clearing day:", clearError);
      return NextResponse.json({ error: clearError.message }, { status: 500 });
    }

    // Set the new day
    const { error: setError } = await supabase
      .from("Schedule")
      .update({ [newDay]: true })
      .eq("business_id", business_id)
      .eq("week", week);

    if (setError) {
      console.error("Error setting new day:", setError);
      return NextResponse.json({ error: setError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST handler error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
