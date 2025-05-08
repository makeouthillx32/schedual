import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
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
    user0x: "role_user",
  };

  const roleColumn = roleColumnMap[profile.role];

  if (!roleColumn) {
    return NextResponse.json({ error: "Unknown role" }, { status: 403 });
  }

  const { data: roleNotifications, error: roleError } = await supabase
    .from("notifications")
    .select("title, subtitle, image_url, action_url")
    .filter(roleColumn, "is", true);

  const { data: directNotifications, error: directError } = await supabase
    .from("notifications")
    .select("title, subtitle, image_url, action_url")
    .eq("receiver_id", user.id);

  if (roleError || directError) {
    return NextResponse.json({ error: "Notification query failed" }, { status: 500 });
  }

  const combined = [...(roleNotifications || []), ...(directNotifications || [])];

  return NextResponse.json({ notifications: combined });
}