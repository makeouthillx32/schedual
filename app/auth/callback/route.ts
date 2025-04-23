import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const inviteCode = requestUrl.searchParams.get("invite");
  const redirectTo = requestUrl.searchParams.get("redirect_to") ?? "/CMS";
  const cookieStore = cookies();

  if (code) {
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Exchange code for session
    await supabase.auth.exchangeCodeForSession(code);

    // Get the current session to access the user
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user;
    if (user) {
      const userId = user.id;

      // Fetch current profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("display_name, role")
        .eq("id", userId)
        .single();

      // ✅ Set display name if missing
      if (!profileError && !profile?.display_name) {
        const defaultName = user.email?.split("@")[0];
        if (defaultName) {
          await supabase
            .from("profiles")
            .update({ display_name: defaultName })
            .eq("id", userId);
        }
      }

      // ✅ Apply invite role if role is missing
      if ((!profile || !profile.role) && inviteCode) {
        const { data: invite, error: inviteError } = await supabase
          .from("invites")
          .select("role")
          .eq("code", inviteCode)
          .single();

        if (!inviteError && invite?.role) {
          await supabase.from("profiles").update({ role: invite.role }).eq("id", userId);
          await supabase.from("invites").delete().eq("code", inviteCode);
        }
      }
    }
  }

  return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
}
