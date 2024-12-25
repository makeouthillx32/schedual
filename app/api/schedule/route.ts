import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const week = searchParams.get("week");
    const day = searchParams.get("day");

    if (!week || !day) {
      return NextResponse.json(
        { error: "Missing week or day parameter" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("Schedule")
      .select(`
        Businesses (business_name)
      `)
      .eq("week", week)
      .eq(day, true);

    if (error) {
      console.error("Error fetching data from Supabase:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
