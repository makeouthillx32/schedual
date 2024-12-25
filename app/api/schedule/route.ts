import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const week = url.searchParams.get("week");
    const day = url.searchParams.get("day");

    if (!week || !day) {
      return NextResponse.json(
        { error: "Missing week or day parameters" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("Schedule")
      .select("Businesses (business_name)")
      .eq("week", week)
      .eq(day, true);

    if (error) {
      console.error("Supabase query error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ schedule: data });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
