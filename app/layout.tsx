// app/layout.tsx

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

      // Dynamically update iOS browser top bar color
      const meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
      if (meta) {
        meta.content = theme === "dark" ? "#1a1c23" : "#f0f2f5";
      } else {
        const newMeta = document.createElement("meta");
        newMeta.name = "theme-color";
        newMeta.content = theme === "dark" ? "#1a1c23" : "#f0f2f5";
        document.head.appendChild(newMeta);
      }
    }
  }, [pathname]);

  return (
    <html lang="en" className={isDarkMode ? "dark" : ""} suppressHydrationWarning>
      <head>
        {/* Static fallback to avoid white flash during initial page load */}
        <meta name="theme-color" content="#f0f2f5" />
      </head>
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