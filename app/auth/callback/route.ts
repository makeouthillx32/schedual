import { cookies as getCookies } from "next/headers";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await getCookies(); // ✅ await here
  const supabase = createServerActionClient({ cookies: () => cookieStore }); // ✅ correct cookie store

  await supabase.auth.getSession(); // ✅ hydrate Supabase session from URL tokens

  const lastPage = cookieStore.get("lastPage")?.value; // ✅ safe read

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://schedual-five.vercel.app";
  return NextResponse.redirect(new URL(lastPage!, baseUrl));
}