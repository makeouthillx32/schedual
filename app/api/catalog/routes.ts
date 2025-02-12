import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sectionId = searchParams.get("sectionId");

  let query = supabase
    .from("Products")
    .select("Product_ID, Item, Price, Section_ID, Subcategory_ID");

  if (sectionId) {
    query = query.eq("Section_ID", sectionId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}