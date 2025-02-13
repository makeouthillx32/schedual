import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// ✅ Handle POST request to add a new product
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received Payload:", body); // 🔥 Debug log

    const { Product_Name, Price, Subsection_ID } = body;

    // ✅ Validate required fields
    if (!Product_Name || !Price || !Subsection_ID) {
      console.error("❌ Missing required fields:", { Product_Name, Price, Subsection_ID }); // 🔥 Debugging
      return NextResponse.json({ error: "Missing required fields", received: { Product_Name, Price, Subsection_ID } }, { status: 400 });
    }

    // ✅ Ensure Subsection_ID exists
    const { data: subsection, error: subsectionError } = await supabase
      .from("Sub_Sections")
      .select("Subsection_ID")
      .eq("Subsection_ID", Subsection_ID)
      .single();

    if (subsectionError || !subsection) {
      return NextResponse.json({ error: "Invalid Subsection_ID" }, { status: 400 });
    }

    // ✅ Insert product (Product_ID auto-generates)
    const { data, error } = await supabase
      .from("Products")
      .insert([{ Product_Name, Price, Subsection_ID }])
      .select("Product_ID, Product_Name, Price, Subsection_ID"); // Fetch inserted row

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