// app/api/profile/set-role/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient("service");
  const { uuid, role } = await req.json();

  if (!uuid || !role) {
    return NextResponse.json({ error: "Missing UUID or role" }, { status: 400 });
  }

  // Get the role ID from the roles table
  const { data: roleData, error: roleError } = await supabase
    .from("roles")
    .select("id")
    .eq("slug", role)
    .single();

  if (roleError || !roleData) {
    return NextResponse.json({ error: "Failed to fetch role ID" }, { status: 500 });
  }

  const roleId = roleData.id;

  // Update the profile with the role ID
  const { error } = await supabase
    .from("profiles")
    .update({ role: roleId })
    .eq("id", uuid);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: `Role updated to '${role}' for user ${uuid}` });
}