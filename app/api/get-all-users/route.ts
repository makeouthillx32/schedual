import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient("service");

  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error("Failed to fetch users:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const simplifiedUsers = data.users.map((user) => ({
    id: user.id,
    email: user.email,
  }));

  return NextResponse.json(simplifiedUsers);
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient("service");
  const { uuid } = await req.json();

  const { error: authError } = await supabase.auth.admin.deleteUser(uuid);
  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .delete()
    .eq("id", uuid);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ message: "User and profile deleted" });
}