import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

const API_DISABLED = process.env.NOTIFICATIONS_API_ENABLED === "false";

export async function GET() {
  if (API_DISABLED) {
    return NextResponse.json(
      { message: "Notifications temporarily disabled." },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile?.role) {
    return NextResponse.json({ error: "Profile role not found" }, { status: 404 });
  }

  const roleColumnMap: Record<string, string> = {
    admin1: "role_admin",
    coachx7: "role_jobcoach",
    client7x: "role_client",
    user0x: "role_anonymous", // fallback to lowest role
  };

  const roleColumn = roleColumnMap[profile.role];

  if (!roleColumn) {
    return NextResponse.json({ error: "Unknown role" }, { status: 403 });
  }

  const { data: notifications, error } = await supabase
    .from("notifications")
    .select("title, subtitle, image_url, action_url")
    .or(`receiver_id.eq.${user.id},${roleColumn}.is.true`)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ notifications });
}
