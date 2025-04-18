import { NextResponse } from "next/server";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies, headers } from "next/headers";

export async function POST(req: Request) {
  const formData = await req.formData();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = createServerActionClient({ cookies });

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const h = await headers(); // ✅ await the headers
    const origin = h.get("origin") || process.env.NEXT_PUBLIC_SITE_URL!;
    return NextResponse.redirect(
      new URL(`/sign-in?error=${encodeURIComponent(error.message)}`, origin)
    );
  }

  const store = await cookies();
  const allCookies = store.getAll();
  const lastPageCookie = allCookies.find((c) => c.name === "lastPage");
  const lastPage = lastPageCookie?.value || "/CMS";

  const h = await headers();
  const origin = h.get("origin") || process.env.NEXT_PUBLIC_SITE_URL!;

  return NextResponse.redirect(new URL(`${lastPage}?refresh=true`, origin));
}