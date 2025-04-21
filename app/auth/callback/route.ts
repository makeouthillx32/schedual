import { cookies } from "next/headers";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

export async function GET() {
  // ‼️ Pass the cookies FUNCTION to Supabase (what it expects)
  const supabase = createServerActionClient({ cookies });

  // Process OAuth tokens and set the session cookie
  await supabase.auth.getSession();

  // Now resolve the cookie store so we can read values
  const cookieStore = await cookies();
  const lastPage = cookieStore.get("lastPage")?.value || "/";

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://schedual-five.vercel.app";

  return NextResponse.redirect(
    new URL(`${lastPage}?refresh=true`, baseUrl)
  );
}
