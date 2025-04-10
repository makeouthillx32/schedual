import { NextResponse } from "next/server";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies(); // ✅ Await the cookies() call
  const supabase = createServerActionClient({ cookies: () => cookieStore });

  await supabase.auth.signOut();

  // ✅ Try to get last visited page from cookies
  const lastPage = cookieStore.get("lastPage")?.value || "/";

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://schedual-five.vercel.app";
  return NextResponse.redirect(new URL(lastPage, baseUrl));
}
