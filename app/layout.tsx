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
  const pathname = usePathname();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Save the current path as the last visited page (client-side only)
    if (typeof window !== "undefined") {
      setCookie("lastPage", pathname); // Save last visited page in cookies
    }
  }, [pathname]);

  useEffect(() => {
    // Handle redirection to the last saved page
    if (typeof window !== "undefined") {
      const lastPage = getCookie("lastPage");
      if (lastPage && lastPage !== pathname && !isRedirecting) {
        setIsRedirecting(true); // Avoid multiple redirects
        window.location.href = lastPage; // Redirect to the saved page
      }
    }
  }, [pathname, isRedirecting]);

  return (
    <html lang="en">
      {/* Dynamically handle theme in the Providers */}
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