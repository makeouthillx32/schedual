// app/auth/callback/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const redirectTo = url.searchParams.get("redirect_to") || "/CMS";

  return NextResponse.redirect(new URL(redirectTo, process.env.NEXT_PUBLIC_SITE_URL));
}