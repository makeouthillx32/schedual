// app/api/notifications/route.ts
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
  
  // Get authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Auth error in notifications route:", userError);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get user's profile to determine role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Profile error:", profileError);
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Role-based column mapping
    const roleColumnMap: Record<string, string> = {
      admin1: "role_admin",
      coachx7: "role_jobcoach", 
      client7x: "role_client",
      user0x: "role_anonymous",
    };

    const roleColumn = roleColumnMap[profile.role];

    // Build query - get notifications targeted to this user specifically OR to their role
    let query = supabase
      .from("notifications")
      .select("id, title, subtitle, image_url, action_url, created_at, receiver_id")
      .order("created_at", { ascending: false })
      .limit(20);

    if (roleColumn) {
      // User-specific notifications OR role-based notifications
      query = query.or(`receiver_id.eq.${user.id},${roleColumn}.is.true`);
    } else {
      // Only user-specific notifications if role unknown
      query = query.eq("receiver_id", user.id);
    }

    const { data: notifications, error } = await query;

    if (error) {
      console.error("Database error fetching notifications:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`Fetched ${notifications?.length || 0} notifications for user ${user.id} (role: ${profile.role})`);
    
    return NextResponse.json({ 
      notifications: notifications || [],
      user_id: user.id,
      user_role: profile.role
    });

  } catch (error) {
    console.error("Unexpected error in notifications route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}