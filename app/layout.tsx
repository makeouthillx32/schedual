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
          <Nav />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
