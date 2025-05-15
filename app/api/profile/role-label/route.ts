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

  // Get role name
  const { data: roleData, error: roleError } = await supabase
    .from("roles")
    .select("role")
    .eq("id", roleId)
    .single();

  if (roleError || !roleData) {
    return NextResponse.json({ error: "Role not found" }, { status: 404 });
  }

  // Get specializations with role name
  const { data: specializations, error: specError } = await supabase
    .from("specializations")
    .select("id, name, description, roles(role)")
    .eq("role_id", roleId);

  if (specError) {
    return NextResponse.json({ error: "Error fetching specializations" }, { status: 500 });
  }

  // Normalize role name into each specialization
  const formattedSpecializations = specializations.map(spec => ({
    id: spec.id,
    name: spec.name,
    description: spec.description,
    role: spec.roles?.role ?? null
  }));

  return NextResponse.json({
    role: roleData.role,
    specializations: formattedSpecializations
  });
}