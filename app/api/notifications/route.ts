// app/api/notifications/route.ts
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // initialize Supabase with incoming request (cookies/session)
  const supabase = createServerSupabaseClient({ req });

  // get the logged-in user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // fetch the user's role from your profiles table
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile?.role) {
    return NextResponse.json(
      { error: "Profile role not found" },
      { status: 404 }
    );
  }

  // map your profile.role values to the boolean columns on notifications
  const roleColumnMap = {
    admin: "role_admin",
    jobcoach: "role_jobcoach",
    client: "role_client",
    user: "role_user",
  } as const;

  const roleColumn = roleColumnMap[profile.role];
  if (!roleColumn) {
    return NextResponse.json({ error: "Unknown role" }, { status: 403 });
  }

  // pull the latest 10 notifications either sent directly to you
  // or flagged for your role
  const { data: notifications, error } = await supabase
    .from("notifications")
    .select(
      "id, title, subtitle, image_url, action_url, created_at"
    )
    .or(
      `receiver_id.eq.${user.id},${roleColumn}.eq.true`
    )
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ notifications });
}