// app/api/profile/set-role/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient("service");
  const { uuid, role } = await req.json();

  if (!uuid || !role) {
    return NextResponse.json({ error: "Missing UUID or role" }, { status: 400 });
  }

  const roleMap: Record<string, string> = {
    admin: "Admin",
    client: "Client",
    job_coach: "Job Coach",
    anonymous: "Anonymous",
  };

  const roleName = roleMap[role];

  if (!roleName) {
    return NextResponse.json({ error: "Invalid role provided" }, { status: 400 });
  }

  const { data: roleData, error: roleError } = await supabase
    .from("roles")
    .select("id")
    .eq("role", roleName)
    .single();

  if (roleError || !roleData) {
    return NextResponse.json({ error: "Failed to fetch role ID" }, { status: 500 });
  }

  const roleId = roleData.id;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ role: roleId })
    .eq("id", uuid);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ message: `Role updated to '${role}' for user ${uuid}` });
}