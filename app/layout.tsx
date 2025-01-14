"use client";

import { Providers } from "./provider"; // Correct import for Providers
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
      if (lastPage && lastPage !== pathname) {
        window.location.href = lastPage; // Redirect to the saved page
      }
    }
  }, [pathname]);

  return (
    <html lang="en">
      <body>
        {/* Wrap application in Providers to ensure context and theme are loaded */}
        <Providers>
          <Nav />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}