import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const week = url.searchParams.get("week");
    const day = url.searchParams.get("day");
    const redirectTo = url.searchParams.get("redirect_to") || "/protected";

    // If this is a Supabase auth redirect (no schedule params), redirect to protected
    if (!week || !day) {
      return NextResponse.redirect(new URL(redirectTo, process.env.NEXT_PUBLIC_SITE_URL));
    }

    // Otherwise, treat it like your schedule query
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