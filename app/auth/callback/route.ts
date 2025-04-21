import { cookies } from "next/headers";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = cookies(); // ✅ get cookie store instance
  const supabase = createServerActionClient({ cookies: () => cookieStore }); // ✅ bind it here

  // Process the OAuth session and store cookies
  await supabase.auth.getSession();

  // Grab lastPage from same cookie store
  const lastPage = cookieStore.get("lastPage")?.value || "/";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // ✅ Trigger ?refresh=true to make sure frontend reads new session
  return NextResponse.redirect(new URL(`${lastPage}?refresh=true`, baseUrl));
}
