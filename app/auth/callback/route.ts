import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  await supabase.auth.getSession();

  const lastPage = cookieStore.get("lastPage")?.value;

  return NextResponse.redirect(
    new URL(lastPage!, process.env.NEXT_PUBLIC_SITE_URL || "https://schedual-five.vercel.app")
  );
}