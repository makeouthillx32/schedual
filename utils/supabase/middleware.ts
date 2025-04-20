import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  /* 1. create a mutable response wrapper */
  let res = NextResponse.next({ request: { headers: req.headers } });

  /* 2. supabase client able to read / write cookies */
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookies) => {
          // keep request + response cookies in‑sync
          cookies.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: { headers: req.headers } });
          cookies.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  /* 3. fetch current session (null if signed‑out) */
  const {
    data: { session },
  } = await supabase.auth.getSession();

  /* 4. protect these route prefixes */
  const protectedPrefixes = ["/protected", "/settings"];
  const isProtected = protectedPrefixes.some(
    (prefix) =>
      req.nextUrl.pathname === prefix ||
      req.nextUrl.pathname.startsWith(`${prefix}/`),
  );

  if (isProtected && !session) {
    // remember where user wanted to go
    const target =
      req.nextUrl.pathname + (req.nextUrl.search ? req.nextUrl.search : "");
    return NextResponse.redirect(
      new URL(`/sign-in?redirect_to=${encodeURIComponent(target)}`, req.url),
    );
  }

  return res;
}

/* 5. run for every route except static assets */
export const config = {
  matcher:
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
};
