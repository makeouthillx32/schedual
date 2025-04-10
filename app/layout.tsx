"use client";

import { Providers } from "./provider";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import "./globals.css";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { setCookie, getCookie } from "@/lib/cookieUtils";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Exclude Nav and Footer for /Tools pages
  const excludeGlobalLayout = pathname?.startsWith("/Tools");

  // Save last visited page in a cookie
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCookie("lastPage", pathname);
    }
  }, [pathname]);

  // Removed the forced redirect code — it can block session recognition

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
