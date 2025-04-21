import { cookies } from "next/headers";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = cookies(); // ✅ this is not a Promise
  const supabase = createServerActionClient({ cookies: () => cookieStore });

  // ✅ Sets the Supabase session cookie from OAuth
  await supabase.auth.getSession();

  // ✅ Safely read lastPage from the same cookie store
  const lastPage = cookieStore.get("lastPage")?.value;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://schedual-five.vercel.app";
  return NextResponse.redirect(new URL(lastPage!, baseUrl));
}