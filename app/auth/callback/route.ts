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

    // Get the current session to access the user
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user;
    if (user) {
      const userId = user.id;

      // Check if display_name is missing in profile
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", userId)
        .single();

      if (!error && !profile?.display_name) {
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
