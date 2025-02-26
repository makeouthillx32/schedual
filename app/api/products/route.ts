import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// ✅ Handle POST request to add a new product
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📩 Received Payload from Frontend:", body);

    let { Product_Name, Price, Sub_Section_ID } = body;

    // ✅ Ensure required fields exist
    if (!Product_Name || !Price || !Sub_Section_ID) {
      console.error("❌ Missing fields:", { Product_Name, Price, Sub_Section_ID });
      return NextResponse.json(
        { error: "Missing required fields", received: { Product_Name, Price, Sub_Section_ID } },
        { status: 400 }
      );
    }

    // ✅ Convert `Price` to a valid number
    Price = parseFloat(Price);
    if (isNaN(Price) || Price <= 0) {
      console.error("❌ Invalid Price:", Price);
      return NextResponse.json({ error: "Invalid Price value" }, { status: 400 });
    }

    // ✅ Convert `Sub_Section_ID` to an integer
    Sub_Section_ID = parseInt(Sub_Section_ID, 10);
    if (isNaN(Sub_Section_ID)) {
      console.error("❌ Invalid Sub_Section_ID:", Sub_Section_ID);
      return NextResponse.json({ error: "Invalid Sub_Section_ID format" }, { status: 400 });
    }

    // ✅ Verify if `Sub_Section_ID` exists
    console.log("🔍 Checking if Sub_Section_ID exists:", Sub_Section_ID);

    const { data: subsection, error: subsectionError } = await supabase
      .from("Sub_Sections")
      .select("Subsection_ID")
      .eq("Subsection_ID", Sub_Section_ID)
      .single();

    if (subsectionError || !subsection) {
      console.error("❌ Invalid Sub_Section_ID:", Sub_Section_ID);
      return NextResponse.json({ error: `Invalid Sub_Section_ID: ${Sub_Section_ID}` }, { status: 400 });
    }

    // ✅ Insert product into `Products`
    console.log("📩 Inserting product:", { Product_Name, Price, Sub_Section_ID });

    const { data, error } = await supabase
      .from("Products")
      .insert([{ Product_Name, Price, Sub_Section_ID }])
      .select("Product_ID, Product_Name, Price, Sub_Section_ID");

    if (error) {
      console.error("❌ Supabase Insert Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("✅ Product Inserted Successfully:", data[0]);

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

    // ✅ Convert `subsectionId` to integer
    const validSubsectionId = parseInt(subsectionId, 10);
    if (isNaN(validSubsectionId)) {
      console.error("❌ Invalid Subsection ID:", subsectionId);
      return NextResponse.json({ error: "Invalid Subsection ID format" }, { status: 400 });
    }

    // ✅ Fetch products by subsection
    console.log(`🔍 Fetching products for Subsection_ID: ${validSubsectionId}`);

    const { data, error } = await supabase
      .from("Products")
      .select("Product_ID, Product_Name, Price, Sub_Section_ID")
      .eq("Sub_Section_ID", validSubsectionId);

    if (error) {
      console.error("❌ Supabase Fetch Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`✅ Fetched ${data.length} products for Subsection ID: ${validSubsectionId}`);

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("❌ API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ✅ Handle DELETE request to remove a product
export async function DELETE(req: Request) {
  try {
    const { productId } = await req.json();
    console.log("🗑 Received delete request for product ID:", productId);

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    // ✅ Delete product
    const { data, error } = await supabase
      .from("Products")
      .delete()
      .eq("Product_ID", productId)
      .select()
      .single();

    if (error) {
      console.error("❌ Supabase Delete Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("✅ Product Deleted:", data);

    return NextResponse.json(
      { message: "✅ Product deleted successfully", deletedProduct: data },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


 