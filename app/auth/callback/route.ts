import { NextResponse } from "next/server";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET() {
  const supabase = createServerActionClient({ cookies });

  // Process the OAuth callback and set the session
  await supabase.auth.getSession();

  // Read lastPage cookie
  const store = await cookies();
  const allCookies = store.getAll();
  const lastPageCookie = allCookies.find((c) => c.name === "lastPage");

  const lastPage = lastPageCookie?.value!;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://schedual-five.vercel.app";

  // ✅ Append ?refresh=true to tell the client to reload session
  return NextResponse.redirect(new URL(`${lastPage}?refresh=true`, baseUrl));
}