import { cookies } from "next/headers";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = cookies();
  const supabase = createServerActionClient({ cookies: () => cookieStore });

  // This processes the OAuth response and sets the session
  await supabase.auth.getSession();

  // Use the same cookie store to get lastPage
  const allCookies = cookieStore.getAll();
  const lastPageCookie = allCookies.find((c) => c.name === "lastPage");
  const lastPage = lastPageCookie?.value!;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://schedual-five.vercel.app";
  return NextResponse.redirect(new URL(lastPage, baseUrl));
}