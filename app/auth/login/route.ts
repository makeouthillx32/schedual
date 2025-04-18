// app/auth/login/route.ts
import { NextResponse } from "next/server";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies, headers } from "next/headers";

export async function GET(req: Request) {
  const supabase = createServerActionClient({ cookies });

  // Parse query params
  const url = new URL(req.url);
  const email = url.searchParams.get("email") || "";
  const password = url.searchParams.get("password") || "";

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const origin = headers().get("origin") || process.env.NEXT_PUBLIC_SITE_URL!;
    return NextResponse.redirect(new URL(`/sign-in?error=${encodeURIComponent(error.message)}`, origin));
  }

  const store = await cookies();
  const lastPage = store.getAll().find((c) => c.name === "lastPage")?.value || "/CMS";

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://schedual-five.vercel.app";
  return NextResponse.redirect(new URL(lastPage, baseUrl));
}