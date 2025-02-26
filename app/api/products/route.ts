import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// ✅ Handle POST request to add a new subsection
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📩 Received Payload for Subsection:", body);

    let { Subsection_Name, Parent_Section_ID } = body;

    // ✅ Ensure required fields exist
    if (!Subsection_Name || !Parent_Section_ID) {
      console.error("❌ Missing fields:", { Subsection_Name, Parent_Section_ID });
      return NextResponse.json(
        { error: "Missing required fields", received: { Subsection_Name, Parent_Section_ID } },
        { status: 400 }
      );
    }

    // ✅ Convert `Parent_Section_ID` to an integer
    Parent_Section_ID = parseInt(Parent_Section_ID, 10);
    if (isNaN(Parent_Section_ID)) {
      console.error("❌ Invalid Parent_Section_ID:", Parent_Section_ID);
      return NextResponse.json({ error: "Invalid Parent_Section_ID format" }, { status: 400 });
    }

    // ✅ Insert new subsection into `Sub_Sections`
    console.log("📩 Inserting Subsection:", { Subsection_Name, Parent_Section_ID });

    const { data, error } = await supabase
      .from("Sub_Sections")
      .insert([{ Subsection_Name, Parent_Section_ID }])
      .select("Subsection_ID, Subsection_Name, Parent_Section_ID");

    if (error) {
      console.error("❌ Supabase Insert Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("✅ Subsection Inserted Successfully:", data[0]);

    return NextResponse.json(
      { message: "✅ Subsection added successfully", subsection: data[0] },
      { status: 201 }
    );
  } catch (err) {
    console.error("❌ API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ✅ Handle GET request to fetch subsections by parent section
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sectionId = searchParams.get("sectionId");

    if (!sectionId) {
      return NextResponse.json({ error: "Section ID is required" }, { status: 400 });
    }

    // ✅ Convert `sectionId` to integer
    const validSectionId = parseInt(sectionId, 10);
    if (isNaN(validSectionId)) {
      console.error("❌ Invalid Section ID:", sectionId);
      return NextResponse.json({ error: "Invalid Section ID format" }, { status: 400 });
    }

    // ✅ Fetch subsections by section
    console.log(`🔍 Fetching subsections for Parent_Section_ID: ${validSectionId}`);

    const { data, error } = await supabase
      .from("Sub_Sections")
      .select("Subsection_ID, Subsection_Name, Parent_Section_ID")
      .eq("Parent_Section_ID", validSectionId);

    if (error) {
      console.error("❌ Supabase Fetch Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`✅ Fetched ${data.length} subsections for Section ID: ${validSectionId}`);

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("❌ API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ✅ Handle DELETE request to remove a subsection
export async function DELETE(req: Request) {
  try {
    const { subsectionId } = await req.json();
    console.log("🗑 Received delete request for Subsection ID:", subsectionId);

    if (!subsectionId) {
      return NextResponse.json({ error: "Subsection ID is required" }, { status: 400 });
    }

    // ✅ Convert `subsectionId` to an integer
    const validSubsectionId = parseInt(subsectionId, 10);
    if (isNaN(validSubsectionId)) {
      console.error("❌ Invalid Subsection ID:", subsectionId);
      return NextResponse.json({ error: "Invalid Subsection ID format" }, { status: 400 });
    }

    // ✅ Delete subsection
    const { data, error } = await supabase
      .from("Sub_Sections")
      .delete()
      .eq("Subsection_ID", validSubsectionId)
      .select()
      .single();

    if (error) {
      console.error("❌ Supabase Delete Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("✅ Subsection Deleted:", data);

    return NextResponse.json(
      { message: "✅ Subsection deleted successfully", deletedSubsection: data },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}