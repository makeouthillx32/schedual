import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Role ID is required" }, { status: 400 });
    }

    const supabase = await createClient("service");

    // First get the role to verify it exists
    const { data: role, error: roleError } = await supabase
      .from("specializations")
      .select("id, name")
      .eq("id", id)
      .single();

    if (roleError) {
      console.error("Error fetching role:", roleError);
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // Fetch all users who have this specialization
    const { data, error } = await supabase
      .from("user_specializations")
      .select(`
        user_id,
        profiles:user_id (
          id,
          display_name,
          email,
          avatar_url
        )
      `)
      .eq("specialization_id", id);

    if (error) {
      console.error("Error fetching role members:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform data to a more usable format
    const members = data.map(item => ({
      id: item.user_id,
      name: item.profiles?.display_name || 'Unknown User',
      email: item.profiles?.email || '',
      avatar_url: item.profiles?.avatar_url || null
    }));

    return NextResponse.json(members);
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}