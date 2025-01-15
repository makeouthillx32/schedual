"use client";

import { Providers } from "./provider";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import "./globals.css";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { setCookie, getCookie } from "@/lib/cookieUtils";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Exclude Nav and Footer for /Tools pages
  const excludeGlobalLayout = pathname?.startsWith("/Tools");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCookie("lastPage", pathname);
    }
  }, [pathname]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const lastPage = getCookie("lastPage");
      if (lastPage && lastPage !== pathname && !isRedirecting) {
        setIsRedirecting(true);
        window.location.href = lastPage;
      }
    }
  }, [pathname, isRedirecting]);

  return (
    <html lang="en">
      <body>
        <Providers>
          {/* Conditionally render Nav and Footer */}
          {!excludeGlobalLayout && <Nav />}
          <main>{children}</main>
          {!excludeGlobalLayout && <Footer />}
        </Providers>
      </body>
    </html>
  );
}