import { cookies } from "next/headers";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export async function GET(req: Request) {
  const supabase = createServerActionClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) {
    return NextResponse.redirect("/sign-in");
  }

  const cookieStore = await cookies(); // ✅ FIXED
  const inviteCode = new URL(req.url).searchParams.get("invite");

  // ✅ Apply invite role
  if (inviteCode) {
    const { data: invite, error: inviteError } = await supabase
      .from("invites")
      .select("role")
      .eq("code", inviteCode)
      .single();

    if (!inviteError && invite?.role) {
      await supabase.from("profiles").update({ role: invite.role }).eq("id", user.id);
      await supabase.from("invites").delete().eq("code", inviteCode);
    }
  }

  // Set display name if not already present
  if (!user.user_metadata?.display_name) {
    const defaultName = user.email?.split("@")[0] || `user-${randomUUID().slice(0, 8)}`;
    await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        display_name: defaultName,
      },
    });
  }

  const lastPage = cookieStore.get("lastPage")?.value || "/";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://schedual-five.vercel.app";

  return NextResponse.redirect(
    new URL(`${lastPage}?refresh=true`, baseUrl)
  );
}
