import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sectionId = searchParams.get("sectionId");
    const subcategoryId = searchParams.get("subcategoryId");
    const getSections = searchParams.get("getSections"); // Fetch all sections
    const getSubcategories = searchParams.get("getSubcategories"); // Fetch all subcategories

    console.log("Received Request:", { sectionId, subcategoryId, getSections, getSubcategories });

    // Fetch all sections
    if (getSections) {
      const { data, error } = await supabase.from("Sections").select("*");
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(data, { status: 200 });
    }

    // Fetch all subcategories within a section
    if (getSubcategories && sectionId) {
      const { data, error } = await supabase
        .from("Sections")
        .select("Subcategory_ID, Subcategory_Name")
        .eq("Section_ID", sectionId);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(data, { status: 200 });
    }

    // Fetch products, optionally filtered by section or subcategory
    let query = supabase
      .from("Products")
      .select("Product_ID, Item, Price, Section_ID, Subcategory_ID");

    if (sectionId) query = query.eq("Section_ID", sectionId);
    if (subcategoryId) query = query.eq("Subcategory_ID", subcategoryId);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    console.log("API Response:", data);
    return NextResponse.json(data, { status: 200 });

  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}