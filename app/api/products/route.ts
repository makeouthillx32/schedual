import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// ✅ Handle POST request to add a new product or subsection
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📩 Received Payload:", body);

    if (body.Product_Name && body.Price && body.Sub_Section_ID) {
      // ✅ Add a new product
      let { Product_Name, Price, Sub_Section_ID } = body;

      // ✅ Ensure correct data types
      Price = parseFloat(Price);
      Sub_Section_ID = parseInt(Sub_Section_ID, 10);

      if (isNaN(Price) || Price <= 0 || isNaN(Sub_Section_ID)) {
        return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
      }

      // ✅ Verify Subsection exists
      const { data: subsection, error: subsectionError } = await supabase
        .from("Sub_Sections")
        .select("Subsection_ID")
        .eq("Subsection_ID", Sub_Section_ID)
        .single();

      if (subsectionError || !subsection) {
        return NextResponse.json({ error: `Invalid Sub_Section_ID: ${Sub_Section_ID}` }, { status: 400 });
      }

      // ✅ Insert product
      const { data, error } = await supabase
        .from("Products")
        .insert([{ Product_Name, Price, Sub_Section_ID }])
        .select("Product_ID, Product_Name, Price, Sub_Section_ID");

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(
        { message: "✅ Product added successfully", product: data[0] },
        { status: 201 }
      );
    }

    if (body.Subsection_Name && body.Parent_Section_ID) {
      // ✅ Add a new subsection
      let { Subsection_Name, Parent_Section_ID } = body;

      Parent_Section_ID = parseInt(Parent_Section_ID, 10);
      if (isNaN(Parent_Section_ID)) {
        return NextResponse.json({ error: "Invalid Parent_Section_ID format" }, { status: 400 });
      }

      // ✅ Verify if the section exists
      const { data: section, error: sectionError } = await supabase
        .from("Main_Sections")
        .select("Section_ID")
        .eq("Section_ID", Parent_Section_ID)
        .single();

      if (sectionError || !section) {
        return NextResponse.json({ error: `Invalid Parent_Section_ID: ${Parent_Section_ID}` }, { status: 400 });
      }

      // ✅ Insert subsection
      const { data, error } = await supabase
        .from("Sub_Sections")
        .insert([{ Subsection_Name, Parent_Section_ID }])
        .select("Subsection_ID, Subsection_Name, Parent_Section_ID");

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(
        { message: "✅ Subsection added successfully", subsection: data[0] },
        { status: 201 }
      );
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
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

    const validSubsectionId = parseInt(subsectionId, 10);
    if (isNaN(validSubsectionId)) {
      return NextResponse.json({ error: "Invalid Subsection ID format" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("Products")
      .select("Product_ID, Product_Name, Price, Sub_Section_ID")
      .eq("Sub_Section_ID", validSubsectionId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ✅ Handle DELETE request to remove a product or subsection
export async function DELETE(req: Request) {
  try {
    const { productId, subsectionId } = await req.json();

    if (productId) {
      console.log("🗑 Deleting Product ID:", productId);

      const { data, error } = await supabase
        .from("Products")
        .delete()
        .eq("Product_ID", productId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(
        { message: "✅ Product deleted successfully", deletedProduct: data },
        { status: 200 }
      );
    }

    if (subsectionId) {
      console.log("🗑 Deleting Subsection ID:", subsectionId);

      // ✅ Prevent deletion if subsection has products
      const { count, error: countError } = await supabase
        .from("Products")
        .select("*", { count: "exact", head: true })
        .eq("Sub_Section_ID", subsectionId);

      if (countError) {
        return NextResponse.json({ error: countError.message }, { status: 500 });
      }

      // ✅ Fix: Ensure `count` is never null
      if ((count ?? 0) > 0) {
        return NextResponse.json(
          { error: "Cannot delete subsection with existing products" },
          { status: 400 }
        );
      }

      const { data, error } = await supabase
        .from("Sub_Sections")
        .delete()
        .eq("Subsection_ID", subsectionId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(
        { message: "✅ Subsection deleted successfully", deletedSubsection: data },
        { status: 200 }
      );
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}