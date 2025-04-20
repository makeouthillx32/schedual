import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  /* ---------- 1. make a mutable response wrapper ---------- */
  let res = NextResponse.next({ request: { headers: req.headers } });

  /* ---------- 2. Supabase client that can read / set cookies ---------- */
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookies) => {
          // update request + response cookies so SSR stays in sync
          cookies.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: { headers: req.headers } });
          cookies.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  /* ---------- 3. fetch session ---------- */
  const {
    data: { user },
  } = await supabase.auth.getUser(); // { user: null } if not signed‑in

  /* ---------- 4. paths that MUST be signed‑in ---------- */
  const protectedPrefixes = ["/protected", "/settings"]; // <‑‑ added “/settings”
  const isProtected = protectedPrefixes.some(
    (prefix) =>
      req.nextUrl.pathname === prefix ||
      req.nextUrl.pathname.startsWith(`${prefix}/`),
  );

  if (isProtected && !user) {
    // send unauthenticated users to sign‑in
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  return res;
}

/* ---------- 5. run for every route except static assets ---------- */
export const config = {
  matcher:
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
};
