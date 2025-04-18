// app/auth/login/route.ts

import { NextResponse } from "next/server";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies, headers } from "next/headers";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = createServerActionClient({ cookies });
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const encoded = encodeURIComponent(error.message);
    const headerStore = await headers();
    return NextResponse.redirect(new URL(`/sign-in?error=${encoded}`, headerStore.get("origin")!));
  }

  // Read last page from cookie (fallback to /CMS)
  const store = await cookies();
  const allCookies = store.getAll();
  const lastPageCookie = allCookies.find((c) => c.name === "lastPage");
  let lastPage = lastPageCookie?.value || "/CMS";

  // Avoid redirecting back to auth pages
  if (["/sign-in", "/sign-up", "/forgot-password"].includes(lastPage)) {
    lastPage = "/CMS";
  }

  const headerStore = await headers();
  const origin = headerStore.get("origin") || "https://yourdomain.com"; // fallback in case origin is null
  const redirectUrl = new URL(lastPage, origin);
  redirectUrl.searchParams.set("refresh", "true");

  return NextResponse.redirect(redirectUrl);
}