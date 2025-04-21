import { cookies } from "next/headers";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies(); // ✅ now it's awaited
  const supabase = createServerActionClient({ cookies: () => cookieStore });

  await supabase.auth.getSession();

  const lastPage = cookieStore.get("lastPage")?.value;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://schedual-five.vercel.app";
  return NextResponse.redirect(new URL(lastPage!, baseUrl));
}