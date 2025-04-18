 // app/auth/login/route.ts
import { NextResponse } from "next/server";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies, headers } from "next/headers";

export async function POST(req: Request) {
  const supabase = createServerActionClient({ cookies });
  const body = await req.formData();
  const email = body.get("email") as string;
  const password = body.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const encoded = encodeURIComponent(error.message);
    return NextResponse.redirect(new URL(`/sign-in?error=${encoded}`, headers().get("origin")!));
  }

  const allCookies = (await cookies()).getAll();
  const lastPage = allCookies.find((c) => c.name === "lastPage")?.value || "/CMS";
  const redirectUrl = new URL(lastPage, headers().get("origin")!);
  redirectUrl.searchParams.set("refresh", "true");

  return NextResponse.redirect(redirectUrl);
}