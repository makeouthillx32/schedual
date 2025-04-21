// app/auth/callback/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const next = searchParams.get("next");

  const redirectTo = next ? decodeURIComponent(next) : "/CMS";

  return NextResponse.redirect(redirectTo);
}
