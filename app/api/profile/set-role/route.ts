// app/api/profile/set-role/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient("service");
  const { uuid, role } = await req.json();

  if (!uuid || !role) {
    return NextResponse.json({ error: "Missing UUID or role" }, { status: 400 });
  }

  // Lookup role_id from roles table using role name
  const { data: roles, error: roleFetchError } = await supabase
    .from("roles")
    .select("id, name");

  if (roleFetchError || !roles) {
    return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 });
  }

  const matchingRole = roles.find((r) => r.name === role);
  if (!matchingRole) {
    return NextResponse.json({ error: `Invalid role: '${role}'` }, { status: 400 });
  }

  // Update profile with the matched role_id
  const { error } = await supabase
    .from("profiles")
    .update({ role_id: matchingRole.id })
    .eq("id", uuid);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    message: `Role updated to '${role}' for user ${uuid}`,
  });
}