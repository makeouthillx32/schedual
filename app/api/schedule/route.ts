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

    // Use the working Supabase RPC function
    const { data, error } = await supabase.rpc("fetch_schedule", {
      input_week: parseInt(week),
      input_day: day,
    });

    if (error) {
      console.error("Supabase RPC Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("Supabase Query Result:", data);

    // Return the result to the frontend
    return NextResponse.json({ schedule: data });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
