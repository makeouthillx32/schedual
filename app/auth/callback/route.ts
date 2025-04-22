import { cookies } from "next/headers";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const supabase = createServerActionClient({ cookies });
  const url = new URL(req.url);
  const invite = url.searchParams.get("invite");

  // Process OAuth tokens and set the session cookie
  await supabase.auth.getSession();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If invite is present and user is valid
  if (invite && user) {
    const { data: inviteRow, error: inviteError } = await supabase
      .from("invites")
      .select("role")
      .eq("code", invite)
      .single();

    if (!inviteError && inviteRow?.role) {
      await supabase.auth.admin.updateUserById(user.id, {
        user_metadata: { role: inviteRow.role },
      });

      await supabase.from("invites").delete().eq("code", invite);
    }
  }

  // Pull the last visited page
  const cookieStore = cookies();
  const lastPage = cookieStore.get("lastPage")?.value || "/";

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://schedual-five.vercel.app";

  return NextResponse.redirect(new URL(`${lastPage}?refresh=true`, baseUrl));
}