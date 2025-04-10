import { NextResponse } from "next/server";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET() {
  // ✅ Pass the built-in `cookies` function directly to createServerActionClient
  const supabase = createServerActionClient({ cookies });

  // Now sign out
  await supabase.auth.signOut();

  // Then read the store after
  const cookieStore = cookies(); // This is the actual cookies store
  const lastPage = cookieStore.get("lastPage")?.value || "/";

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://schedual-five.vercel.app";
  return NextResponse.redirect(new URL(lastPage, baseUrl));
}
