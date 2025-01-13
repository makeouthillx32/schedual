import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: Request) {
  try {
    // Parse query parameters
    const url = new URL(req.url);
    const week = url.searchParams.get("week");
    const day = url.searchParams.get("day");

    if (!week || !day) {
      console.error("Missing week or day parameters");
      return NextResponse.json(
        { error: "Missing week or day parameters" },
        { status: 400 }
      );
    }

    console.log(`API received: week=${week}, day=${day}`);

    // Validate week as an integer
    const parsedWeek = parseInt(week);
    if (isNaN(parsedWeek)) {
      console.error("Invalid week parameter");
      return NextResponse.json({ error: "Invalid week parameter" }, { status: 400 });
    }

    // Query the `Schedule` table for matching records
    const { data: schedules, error } = await supabase
      .from("Schedule")
      .select(
        `
        business_id,
        Businesses!inner(business_name, address, before_open)
      `
      )
      .eq(day, true)
      .eq("week", parsedWeek);

    if (error) {
      console.error("Supabase Query Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!schedules || schedules.length === 0) {
      console.warn("No schedules found for the given week and day");
      return NextResponse.json(
        { schedule: [], message: "No schedules available for the given week and day" },
        { status: 200 }
      );
    }

    // Format the response to include jobs
    const jobs = ["Sweep and Mop", "Vacuum", "Bathrooms and Trash"];
    const schedule = schedules.map((entry: any) => ({
      business_name: entry.Businesses.business_name,
      address: entry.Businesses.address,
      before_open: entry.Businesses.before_open,
      jobs,
    }));

    console.log("Formatted Schedule:", schedule);

    return NextResponse.json({ schedule });
  } catch (error) {
    console.error("API Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}