// app/api/schedule/businesses/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get("id");

  try {
    if (businessId) {
      // Get specific business with notes
      const { data, error } = await supabase
        .from("Businesses")
        .select("id, business_name, address, before_open, business_notes")
        .eq("id", businessId)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data);
    } else {
      // Get all businesses with notes
      const { data, error } = await supabase
        .from("Businesses")
        .select("id, business_name, address, before_open, business_notes")
        .order("business_name");

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data);
    }
  } catch (error) {
    console.error("GET API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { business_name, address, before_open, notes } = body;

    if (!business_name || !address) {
      return NextResponse.json({ error: "Missing required fields: business_name and address" }, { status: 400 });
    }

    // Prepare notes data
    let business_notes = [];
    if (notes && Array.isArray(notes) && notes.length > 0) {
      business_notes = notes.map((note, index) => ({
        id: `note_${Date.now()}_${index}`,
        type: note.type || "general",
        title: note.title || "",
        content: note.content || "",
        created_at: new Date().toISOString()
      }));
    }

    const { data, error } = await supabase
      .from("Businesses")
      .insert([{ 
        business_name, 
        address, 
        before_open: before_open || false,
        business_notes: business_notes
      }])
      .select()
      .single();

    if (error) {
      console.error("POST Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("POST API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, business_name, address, before_open, notes } = body;

    if (!id) {
      return NextResponse.json({ error: "Business ID is required" }, { status: 400 });
    }

    // Build update object
    const updateData: any = {};
    
    if (business_name !== undefined) updateData.business_name = business_name;
    if (address !== undefined) updateData.address = address;
    if (before_open !== undefined) updateData.before_open = before_open;

    // Handle notes if provided
    if (notes !== undefined) {
      if (Array.isArray(notes)) {
        updateData.business_notes = notes.map((note, index) => ({
          id: note.id || `note_${Date.now()}_${index}`,
          type: note.type || "general",
          title: note.title || "",
          content: note.content || "",
          created_at: note.created_at || new Date().toISOString()
        }));
      } else {
        updateData.business_notes = [];
      }
    }

    const { data, error } = await supabase
      .from("Businesses")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("PATCH Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("PATCH API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing business ID" }, { status: 400 });
    }

    const { error } = await supabase
      .from("Businesses")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("DELETE Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}