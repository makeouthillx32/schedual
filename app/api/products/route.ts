import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// ✅ Handle POST request to add a new product
export async function POST(req: Request) {
  try {
    const { Product_Name, Price, Sub_Section_ID } = await req.json();

    // ✅ Validate required fields
    if (!Product_Name || !Price || !Sub_Section_ID) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // ✅ Ensure Sub_Section_ID exists
    const { data: subsection, error: subsectionError } = await supabase
      .from("Sub_Sections")
      .select("Sub_Section_ID")
      .eq("Sub_Section_ID", Sub_Section_ID)
      .single();

    if (subsectionError || !subsection) {
      return NextResponse.json({ error: "Invalid Sub_Section_ID" }, { status: 400 });
    }

    // ✅ Insert product (Product_ID auto-generates)
    const { data, error } = await supabase
      .from("Products")
      .insert([{ Product_Name, Price, Sub_Section_ID }])
      .select("Product_ID, Product_Name, Price, Sub_Section_ID"); // Fetch inserted row

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: "✅ Product added successfully", product: data[0] },
      { status: 201 }
    );

  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ✅ Handle GET request to fetch products by subsection
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
      .select("Product_ID, Product_Name, Price, Sub_Section_ID")
      .eq("Sub_Section_ID", subsectionId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });

  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}