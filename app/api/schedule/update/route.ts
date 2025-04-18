import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { business_id, week, currentDay, newDay } = await req.json();

    if (!business_id || !week || !currentDay || !newDay) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Clear currentDay
    const { error: clearError } = await supabase
      .from("Schedule")
      .update({ [currentDay]: false })
      .eq("business_id", business_id)
      .eq("week", week);

    if (clearError) {
      console.error("Error clearing day:", clearError);
      return NextResponse.json({ error: clearError.message }, { status: 500 });
    }

    // Set newDay
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
    console.error("Unhandled error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}