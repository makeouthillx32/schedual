import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { roleId, userId } = await req.json();

    if (!roleId || !userId) {
      return NextResponse.json({ 
        error: "Role ID and user ID are required" 
      }, { status: 400 });
    }

    const supabase = await createClient("service");

    // Remove the user from the role
    const { error } = await supabase
      .from("user_specializations")
      .delete()
      .eq("specialization_id", roleId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error removing user from role:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "User removed from role successfully"
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}