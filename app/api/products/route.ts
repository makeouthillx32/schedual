import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// **Handle POST request to add a new product**
export async function POST(req: Request) {
  try {
    const { Product_Name, Price, Sub_Section_ID } = await req.json();

    // ✅ Validate required fields
    if (!Product_Name || !Price || !Sub_Section_ID) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // ✅ Check if the provided Sub_Section_ID exists
    const { data: subsection, error: subsectionError } = await supabase
      .from("Sub_Sections")
      .select("Subsection_ID")
      .eq("Subsection_ID", Sub_Section_ID)
      .single();

    if (subsectionError) {
      return NextResponse.json({ error: subsectionError.message }, { status: 400 });
    }
    if (!subsection) {
      return NextResponse.json({ error: "Invalid subsection ID" }, { status: 400 });
    }

    // ✅ Insert the new product (WITHOUT specifying `Product_ID` so it auto-generates)
    const { data, error } = await supabase
      .from("Products")
      .insert([{ Product_Name, Price, Sub_Section_ID }])
      .select(); // Fetch the inserted row

    if (error) {
      console.error("Supabase Insert Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "✅ Product added successfully", product: data[0] }, { status: 201 });

  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// **Handle GET request to fetch products by subsection**
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subsectionId = searchParams.get("subsectionId");

    if (!subsectionId) {
      return NextResponse.json({ error: "Subsection ID is required" }, { status: 400 });
    }

    // ✅ Fetch products by subsection
    const { data, error } = await supabase
      .from("Products")
      .select("*")
      .eq("Sub_Section_ID", subsectionId);

    if (error) {
      console.error("Supabase Fetch Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });

  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}