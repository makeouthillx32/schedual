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

    // Attach invite to user metadata if present
    if (inviteCode) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase.auth.updateUser({
          data: { invite: inviteCode },
        });
      }
    }

    // Set display name if missing
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user;
    if (user) {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single();

      if (!error && !profile?.display_name) {
        const defaultName = user.email?.split("@")[0];
        if (defaultName) {
          await supabase
            .from("profiles")
            .update({ display_name: defaultName })
            .eq("id", user.id);
        }
      }
    }
  }

  return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
}