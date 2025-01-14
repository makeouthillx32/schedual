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
  const pathname = usePathname(); // Get the current path

  useEffect(() => {
    // Save the current path as the last visited page
    setCookie("lastPage", pathname);
  }, [pathname]);

  useEffect(() => {
    // Redirect to the last visited page on load
    const lastPage = getCookie("lastPage");
    if (lastPage && pathname === "/") {
      window.location.href = lastPage; // Redirect to the last visited page
    }
  }, []);

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