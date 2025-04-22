import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error("Failed to fetch users:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return only UUID and email to keep the payload light
  const simplifiedUsers = data.users.map((user) => ({
    id: user.id,
    email: user.email,
  }));

  return NextResponse.json(simplifiedUsers);
}