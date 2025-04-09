import { NextResponse } from "next/server";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET() {
  const supabase = createServerActionClient({ cookies });

  await supabase.auth.signOut();

  // ✅ fallback to localhost if env is missing
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return NextResponse.redirect(new URL("/", baseUrl));
}
