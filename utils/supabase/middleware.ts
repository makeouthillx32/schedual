// utils/supabase/middleware.ts - FINAL FIX
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  // ✅ CRITICAL: Explicitly allow CMS routes and their API calls
  const publicRoutes = [
    '/CMS',
    '/api/schedule/members',
    '/api/schedule/daily-instances',
    '/api/schedule/businesses',
    '/api/Weather'
  ];

  const isPublicRoute = publicRoutes.some(route => 
    req.nextUrl.pathname === route || 
    req.nextUrl.pathname.startsWith(`${route}/`) ||
    req.nextUrl.pathname.startsWith(route)
  );

  if (isPublicRoute) {
    console.log(`[Middleware] Allowing public route: ${req.nextUrl.pathname}`);
    return NextResponse.next();
  }

  // Continue with normal middleware logic for protected routes
  let res = NextResponse.next();

  const invite = req.nextUrl.searchParams.get("invite");
  if (invite) {
    res.cookies.set("invite", invite, {
      path: "/",
      maxAge: 60 * 10, // 10 minutes
    });
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const protectedPrefixes = ["/protected", "/settings", "/api/messages"];
  const isProtected = protectedPrefixes.some(
    (prefix) =>
      req.nextUrl.pathname === prefix ||
      req.nextUrl.pathname.startsWith(`${prefix}/`)
  );

  if (isProtected && !session) {
    const target = req.nextUrl.pathname + (req.nextUrl.search || "");
    console.log(`[Middleware] Redirecting protected route: ${target}`);
    return NextResponse.redirect(
      new URL(`/sign-in?redirect_to=${encodeURIComponent(target)}`, req.url)
    );
  }

  return res;
}

export const config = {
  matcher:
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
};