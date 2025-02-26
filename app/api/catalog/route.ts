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
      const { data, error } = await supabase
        .from("Sub_Sections")
        .select("Sub_Section_ID, Sub_Section_Name, Parent_Section_ID")
        .eq("Parent_Section_ID", sectionId);

      if (error) {
        console.error("❌ Error fetching subsections:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      console.log(`✅ Subsections Fetched for Section ${sectionId}:`, data);
      return NextResponse.json(data, { status: 200 });
    }

    // ✅ Fetch All Products for a Specific Subsection
    if (getProducts && subsectionId) {
      const { data, error } = await supabase
        .from("Products")
        .select("Product_ID, Product_Name, Price, Sub_Section_ID")
        .eq("Sub_Section_ID", subsectionId);

      if (error) {
        console.error("❌ Error fetching products:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      console.log(`✅ Products Fetched for Subsection ${subsectionId}:`, data);
      return NextResponse.json(data, { status: 200 });
    }

    // ✅ Fetch Full Category Tree (Sections → Subsections → Products)
    if (getFullTree) {
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
        console.error("❌ Error fetching full tree:", error.message);
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