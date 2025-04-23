import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const cookieStore = cookies();

  if (code) {
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Set the session using the OAuth code
    await supabase.auth.exchangeCodeForSession(code);

    // ✅ Fetch session info to get the user
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;

    if (user) {
      const userId = user.id;

      // ✅ Check if display_name exists
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", userId)
        .single();

      if (!profileError && !profile?.display_name) {
        // ✅ Create default name from email before @
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

  const redirectTo =
    requestUrl.searchParams.get("redirect_to") ?? "/CMS";
  return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
}
