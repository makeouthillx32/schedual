import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const roleId = url.searchParams.get("role_id");
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  if (!roleId) {
    return NextResponse.json({ error: "Missing role_id" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("roles")
    .select("role")
    .eq("id", roleId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Role not found" }, { status: 404 });
  }

  return NextResponse.json({ role: data.role });
}