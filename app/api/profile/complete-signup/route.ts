
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { userId, inviteCode } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // 1. Check if profile exists
    const { data: existingProfile, error: checkError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (checkError) {
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    if (!existingProfile) {
      // 2. Insert profile if missing
      const { error: insertError } = await supabaseAdmin
        .from("profiles")
        .insert({ id: userId, role: "anonymous" });

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
    }

    // 3. If invite code exists, apply invite role
    if (inviteCode) {
      const { data: inviteData, error: inviteError } = await supabaseAdmin
        .from("invites")
        .select("role_id")
        .eq("code", inviteCode)
        .maybeSingle();

      if (inviteError) {
        return NextResponse.json({ error: inviteError.message }, { status: 500 });
      }

      if (inviteData?.role_id) {
        // Update profile role
        await supabaseAdmin
          .from("profiles")
          .update({ role: inviteData.role_id })
          .eq("id", userId);

        // Delete the invite
        await supabaseAdmin
          .from("invites")
          .delete()
          .eq("code", inviteCode);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[complete-signup API error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}