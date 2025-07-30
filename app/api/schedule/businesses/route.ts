// app/api/schedule/businesses/route.ts - FIXED TO SUPPORT ID PARAMETER

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  try {
    if (id) {
      // Get specific business by ID
      const { data, error } = await supabase
        .from("Businesses")
        .select("id, business_name, address, before_open")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching business:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (!data) {
        return NextResponse.json({ error: "Business not found" }, { status: 404 });
      }

      return NextResponse.json(data);
    } else {
      // Get all businesses
      const { data, error } = await supabase
        .from("Businesses")
        .select("id, business_name, address, before_open")
        .order("business_name");

      if (error) {
        console.error("Error fetching businesses:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data || []);
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { business_name, address, before_open } = body;

  if (!business_name || !address) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const { error, data } = await supabase
    .from("Businesses")
    .insert([{ business_name, address, before_open }]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing business ID" }, { status: 400 });
  }

  const { error } = await supabase.from("Businesses").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}