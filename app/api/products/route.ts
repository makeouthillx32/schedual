import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// **Handle POST request to add a new product**
export async function POST(req: Request) {
  try {
    const { Product_Name, Price, Sub_Section_ID } = await req.json();

    // Validate required fields
    if (!Product_Name || !Price || !Sub_Section_ID) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if the provided Sub_Section_ID exists
    const { data: subsection, error: subsectionError } = await supabase
      .from("Sub_Sections")
      .select("Subsection_ID")
      .eq("Subsection_ID", Sub_Section_ID)
      .single();

    if (subsectionError || !subsection) {
      return NextResponse.json({ error: "Invalid subsection ID" }, { status: 400 });
    }

    // Insert the new product into the database
    const { data, error } = await supabase
      .from("Products")
      .insert([{ Product_Name, Price, Sub_Section_ID }])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Product added successfully", product: data[0] }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}