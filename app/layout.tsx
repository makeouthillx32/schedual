"use client";

import { Providers } from "./provider";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import "./globals.css";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { setCookie } from "@/lib/cookieUtils";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Hide layout on homepage and /Tools
  const excludeGlobalLayout =
    pathname === "/" || pathname?.startsWith("/Tools");

  useEffect(() => {
    if (typeof window !== "undefined") {
      /* ▸ don’t record auth‑related pages as “lastPage” */
      const isAuthPage =
        pathname === "/sign-in" ||
        pathname === "/sign-up" ||
        pathname.startsWith("/auth");

      if (!isAuthPage) {
        setCookie("lastPage", pathname, { path: "/" });
      }

      // Sync dark mode from localStorage
      const theme = localStorage.getItem("theme");
      setIsDarkMode(theme === "dark");

      // ✨ Dynamically set theme-color for iOS Safari top bar
      const metaThemeColor = document.querySelector("meta[name=theme-color]") || document.createElement("meta");
      metaThemeColor.setAttribute("name", "theme-color");
      metaThemeColor.setAttribute("content", theme === "dark" ? "#09090b" : "#f9fafb");

      if (!document.head.contains(metaThemeColor)) {
        document.head.appendChild(metaThemeColor);
      }
    }
  }, [pathname]);

  return (
    <html lang="en" className={isDarkMode ? "dark" : ""} suppressHydrationWarning>
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
