import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { roleId, userIds } = await req.json();

    if (!roleId || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ 
        error: "Role ID and at least one user ID are required" 
      }, { status: 400 });
    }

    const supabase = await createClient("service");

    // Verify the role exists
    const { data: role, error: roleError } = await supabase
      .from("specializations")
      .select("id")
      .eq("id", roleId)
      .single();

    if (roleError) {
      console.error("Error verifying role:", roleError);
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // Prepare the data for batch insertion
    const insertData = userIds.map(userId => ({
      user_id: userId,
      specialization_id: roleId,
      assigned_by: "system" // This could be the current user's ID in a real implementation
    }));

    // Add the users to the role
    const { error } = await supabase
      .from("user_specializations")
      .upsert(insertData, { 
        onConflict: 'user_id,specialization_id',
        ignoreDuplicates: true
      });

    if (error) {
      console.error("Error adding users to role:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Added ${userIds.length} user(s) to the role`
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}