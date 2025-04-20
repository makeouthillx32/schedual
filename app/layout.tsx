"use client";

import { Providers } from "./provider";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import "./globals.css";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { setCookie } from "@/lib/cookieUtils";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Hide layout on homepage and /Tools
  const excludeGlobalLayout = pathname === "/" || pathname?.startsWith("/Tools");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCookie("lastPage", pathname);
    }
  }, [pathname]);

  return (
    <html lang="en">
      <body>
        <Providers>
          {!excludeGlobalLayout && <Nav />}
          <main>{children}</main>
          {!excludeGlobalLayout && <Footer />}
        </Providers>
      </body>
    </html>
  );
}
