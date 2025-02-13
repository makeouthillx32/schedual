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

    console.log("API Request Params:", {
      sectionId, subsectionId, getSections, getSubsections, getProducts, getFullTree
    });

    // **Fetch All Main Sections**
    if (getSections) {
      const { data, error } = await supabase
        .from("Main_Sections")
        .select("Section_ID, Section_Name")
        .order("Section_Name", { ascending: true });

      if (error) {
        console.error("Supabase Error (Main_Sections):", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json(data, { status: 200 });
    }

    // **Fetch All Subsections for a Specific Main Section**
    if (getSubsections && sectionId) {
      const { data, error } = await supabase
        .from("Sub_Sections")
        .select("Subsection_ID, Subsection_Name, Parent_Section_ID")
        .eq("Parent_Section_ID", sectionId)
        .order("Subsection_Name", { ascending: true });

      if (error) {
        console.error("Supabase Error (Sub_Sections):", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json(data, { status: 200 });
    }

    // **Fetch All Products for a Specific Subsection**
    if (getProducts && subsectionId) {
      const { data, error } = await supabase
        .from("Products")
        .select("Product_ID, Item, Price, Subsection_ID")
        .eq("Subsection_ID", subsectionId)
        .order("Item", { ascending: true });

      if (error) {
        console.error("Supabase Error (Products):", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json(data, { status: 200 });
    }

    // **Fetch Full Category Tree (Sections → Subsections → Products)**
    if (getFullTree) {
      const { data, error } = await supabase
        .from("Main_Sections")
        .select(`
          Section_ID, Section_Name,
          Sub_Sections (
            Subsection_ID, Subsection_Name,
            Products (
              Product_ID, Item, Price
            )
          )
        `)
        .order("Section_Name", { ascending: true });

      if (error) {
        console.error("Supabase Error (Full Tree):", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json(data, { status: 200 });
    }

    // **Invalid Request**
    return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 });

  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}