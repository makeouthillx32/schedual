import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// ✅ Handle POST request to add a new product
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📩 Received Payload:", body);

    const { Product_Name, Price, Subsection_ID } = body;

    // ✅ Validate required fields
    const missingFields = [];
    if (!Product_Name) missingFields.push("Product_Name");
    if (!Price) missingFields.push("Price");
    if (!Subsection_ID) missingFields.push("Subsection_ID");

    if (missingFields.length > 0) {
      console.error("❌ Missing fields:", missingFields);
      return NextResponse.json(
        { error: "Missing required fields", missing: missingFields, received: body },
        { status: 400 }
      );
    }

    // ✅ Verify if Subsection_ID exists
    const { data: subsection, error: subsectionError } = await supabase
      .from("Sub_Sections")
      .select("Subsection_ID")
      .eq("Subsection_ID", Subsection_ID)
      .single();

    if (subsectionError || !subsection) {
      console.error("❌ Invalid Subsection_ID:", Subsection_ID);
      return NextResponse.json({ error: "Invalid Subsection_ID" }, { status: 400 });
    }

    // ✅ Insert product (Auto-generating Product_ID)
    const { data, error } = await supabase
      .from("Products")
      .insert([{ Product_Name, Price, Subsection_ID }])
      .select("Product_ID, Product_Name, Price, Subsection_ID");

    if (error) {
      console.error("❌ Supabase Insert Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("✅ Product Inserted:", data[0]);

    return NextResponse.json(
      { message: "✅ Product added successfully", product: data[0] },
      { status: 201 }
    );
  } catch (err) {
    console.error("❌ API Error:", err);
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
      .select("Product_ID, Product_Name, Price, Subsection_ID")
      .eq("Subsection_ID", subsectionId);

    if (error) {
      console.error("❌ Supabase Fetch Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`✅ Fetched ${data.length} products for Subsection ID: ${subsectionId}`);

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("❌ API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}