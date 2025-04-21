import { NextResponse } from "next/server";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET() {
  const supabase = createServerActionClient({ cookies });

  // Force Supabase to process the OAuth callback and set the session
  await supabase.auth.getSession();

  // Grab cookies and find lastPage
  const store = await cookies();
  const allCookies = store.getAll();
  const lastPageCookie = allCookies.find((c) => c.name === "lastPage");

  const lastPage = lastPageCookie?.value!; // no fallback

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://schedual-five.vercel.app";
  return NextResponse.redirect(new URL(lastPage, baseUrl));
} 

Dose it 