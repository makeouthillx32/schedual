// app/api/profile/set-role/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient("service");
  const { uuid, role } = await req.json();

  if (!uuid || !role) {
    return NextResponse.json({ error: "Missing UUID or role" }, { status: 400 });
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", uuid);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: `Role updated to '${role}' for user ${uuid}` });
}