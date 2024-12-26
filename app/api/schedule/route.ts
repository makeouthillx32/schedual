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

    // Fetch schedule with jobs and members
    const { data, error } = await supabase
      .from("Schedule")
      .select(`
        Businesses (business_name),
        Jobs (job_type, Members (member_name))
      `)
      .eq("week", parseInt(week))
      .eq(day, true);

    if (error) {
      console.error("Supabase Query Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("Supabase Query Result:", data);

    // Check if data exists
    if (!data || data.length === 0) {
      console.warn("No data returned from Supabase.");
      return NextResponse.json({ schedule: [] });
    }

    // Process the data to match frontend requirements
    const formattedData = data.map((scheduleEntry: any) => ({
      business_name: scheduleEntry.Businesses?.business_name || "Unknown",
      jobs: scheduleEntry.Jobs?.map((job: any) => ({
        job_type: job.job_type || "Unknown",
        member_name: job.Members?.member_name || "Unassigned",
      })) || [],
    }));

    console.log("Formatted Data:", formattedData);

    // Return the result to the frontend
    return NextResponse.json({ schedule: formattedData });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
