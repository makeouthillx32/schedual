import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sectionId = searchParams.get("sectionId");
    const subsectionId = searchParams.get("subsectionId");
    const getSections = searchParams.get("getSections");
    const getSubsections = searchParams.get("getSubsections");
    const getProducts = searchParams.get("getProducts");
    const getFullTree = searchParams.get("getFullTree");

    console.log("📩 API Request Params:", {
      sectionId, subsectionId, getSections, getSubsections, getProducts, getFullTree
    });

    // ✅ Fetch All Main Sections
    if (getSections) {
      const { data, error } = await supabase
        .from("Main_Sections")
        .select("Section_ID, Section_Name");

      if (error) {
        console.error("❌ Error fetching sections:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      console.log("✅ Sections Fetched:", data);
      return NextResponse.json(data, { status: 200 });
    }

    // ✅ Fetch All Subsections for a Specific Main Section
    if (getSubsections && sectionId) {
      console.log(`📩 Fetching subsections for Section_ID: ${sectionId}`);

      const { data, error } = await supabase
        .from("Sub_Sections")
        .select("Sub_Section_ID, Sub_Section_Name, Parent_Section_ID")
        .eq("Parent_Section_ID", sectionId);

      if (error) {
        console.error("❌ Supabase Fetch Error (Subsections):", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (data.length === 0) {
        console.warn(`⚠️ No subsections found for Section_ID: ${sectionId}`);
      }

      console.log("✅ Subsections Fetched:", data);
      return NextResponse.json(data, { status: 200 });
    }

    // ✅ Fetch All Products for a Specific Subsection
    if (getProducts && subsectionId) {
      console.log(`📩 Fetching products for Sub_Section_ID: ${subsectionId}`);

      const { data, error } = await supabase
        .from("Products")
        .select("Product_ID, Product_Name, Price, Sub_Section_ID")
        .eq("Sub_Section_ID", subsectionId);

      if (error) {
        console.error("❌ Supabase Fetch Error (Products):", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (data.length === 0) {
        console.warn(`⚠️ No products found for Sub_Section_ID: ${subsectionId}`);
      }

      console.log("✅ Products Fetched:", data);
      return NextResponse.json(data, { status: 200 });
    }

    // ✅ Fetch Full Category Tree (Sections → Subsections → Products)
    if (getFullTree) {
      console.log("📩 Fetching full category tree...");

      const { data, error } = await supabase
        .from("Main_Sections")
        .select(`
          Section_ID, Section_Name,
          Sub_Sections (
            Sub_Section_ID, Sub_Section_Name,
            Products (
              Product_ID, Product_Name, Price, Sub_Section_ID
            )
          )
        `);

      if (error) {
        console.error("❌ Supabase Fetch Error (Full Tree):", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      console.log("✅ Full Tree Fetched:", data);
      return NextResponse.json(data, { status: 200 });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  } catch (err) {
    console.error("❌ API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}