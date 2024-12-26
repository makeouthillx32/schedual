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

    // Query the businesses scheduled for this week and day
    const { data: businesses, error } = await supabase
      .from("Schedule")
      .select(
        `
        business_id,
        Businesses!inner(business_name, address, before_open)
      `
      )
      .eq(day, true)
      .eq("week", parseInt(week));

    if (error) {
      console.error("Supabase Query Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Format the response to include jobs
    const jobs = ["Sweep and Mop", "Vacuum", "Bathrooms and Trash"];
    const schedule = businesses.map((entry: any) => ({
      business_name: entry.Businesses.business_name,
      address: entry.Businesses.address,
      before_open: entry.Businesses.before_open,
      jobs,
    }));

    console.log("Formatted Schedule:", schedule);

    return NextResponse.json({ schedule });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
