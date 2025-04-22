import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function DELETE(req: Request) {
  const { uuid } = await req.json();

  if (!uuid) {
    return NextResponse.json({ error: "Missing UUID" }, { status: 400 });
  }

  const supabase = await createClient("service"); // Uses service role

  // Step 1: Delete profile row
  const { error: profileError } = await supabase
    .from("profiles")
    .delete()
    .eq("id", uuid);

  if (profileError) {
    console.error("❌ Failed to delete profile:", profileError.message);
  }

  // Step 2: Delete auth user
  const { error: authError } = await supabase.auth.admin.deleteUser(uuid);

  if (authError) {
    console.error("❌ Failed to delete auth user:", authError.message);
    return NextResponse.json({ error: "Auth user deletion failed" }, { status: 500 });
  }

  return NextResponse.json({ message: "✅ User and profile deleted successfully" });
}