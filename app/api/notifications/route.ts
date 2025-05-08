// app/api/notifications/route.ts
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const { data: notifications, error } = await supabase
    .from("notifications")
    .select("*")
    .or(`user_id.eq.${user.id},role.eq.${profile.role}`)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(notifications);
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const body = await req.json();

  const {
    user_id,
    role,
    title,
    subtitle,
    image_url,
    resource_type,
    resource_id,
  } = body;

  const { error } = await supabase.from("notifications").insert([
    {
      user_id,
      role,
      title,
      subtitle,
      image_url,
      resource_type,
      resource_id,
    },
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}