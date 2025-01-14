"use client";

import { Providers } from "./provider"; // Lowercase 'p'
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
  const pathname = usePathname(); // Get the current path
  const [isRedirecting, setIsRedirecting] = useState(false); // Prevent double renders

  useEffect(() => {
    // Save the current path as the last visited page
    if (typeof document !== "undefined") {
      setCookie("lastPage", pathname); // Only save if it's a client-side render
    }
  }, [pathname]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const lastPage = getCookie("lastPage");

      // Redirect only if the current path is different from the last saved page
      if (lastPage && lastPage !== pathname && !isRedirecting) {
        setIsRedirecting(true); // Prevent re-executing this logic
        window.location.href = lastPage; // Redirect to the last visited page
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