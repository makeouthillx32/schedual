// app/api/profile/set-role/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient("service");
  const { uuid, role } = await req.json();

  if (!uuid || !role) {
    return NextResponse.json({ error: "Missing UUID or role" }, { status: 400 });
  }

  const { data: roleRow, error: roleError } = await supabase
    .from("roles")
    .select("id")
    .eq("name", role)
    .maybeSingle();

  if (roleError || !roleRow?.id) {
    return NextResponse.json({ error: "Failed to fetch role ID" }, { status: 500 });
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ role: roleRow.id })
    .eq("id", uuid);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ message: `Role updated to '${role}' for user ${uuid}` });
}