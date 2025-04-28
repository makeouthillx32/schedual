import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirectTo = requestUrl.searchParams.get("redirect_to") ?? "/CMS";
  const cookieStore = cookies();

  if (code) {
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Exchange code for session
    await supabase.auth.exchangeCodeForSession(code);

    // Get fresh session user
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const userId = user.id;
      const inviteCode = user.user_metadata?.invite;

      // 1. Apply invite role if invite code exists
      if (inviteCode) {
        const { data: invite, error: inviteError } = await supabase
          .from("invites")
          .select("role_id")
          .eq("code", inviteCode)
          .maybeSingle();

        if (!inviteError && invite?.role_id) {
          // Update user profile role
          await supabase
            .from("profiles")
            .update({ role: invite.role_id })
            .eq("id", userId);

          // Delete the invite so it's one-time use
          await supabase
            .from("invites")
            .delete()
            .eq("code", inviteCode);
        }
      }

      // 2. Set display name if missing
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", userId)
        .maybeSingle();

      if (!profileError && !profile?.display_name) {
        const defaultName = user.email?.split("@")[0];
        if (defaultName) {
          await supabase
            .from("profiles")
            .update({ display_name: defaultName })
            .eq("id", userId);
        }
      }
    }
  }

  return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
}