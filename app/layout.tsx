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

  // Hide layout on homepage only
  const excludeGlobalLayout = pathname === "/";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuthPage =
        pathname === "/sign-in" ||
        pathname === "/sign-up" ||
        pathname.startsWith("/auth");

      if (!isAuthPage) {
        setCookie("lastPage", pathname, { path: "/" });
      }

      const theme = localStorage.getItem("theme");
      setIsDarkMode(theme === "dark");

      let color = "#ffffff"; // default fallback

      const style = getComputedStyle(document.documentElement);

      if (pathname === "/") {
        // Home page
        color = style.getPropertyValue("--home-nav-bg").trim();
      } else {
        // App pages (CMS, etc.)
        color = style.getPropertyValue("--hnf-background").trim();
      }

      const metaTag = document.querySelector("meta[name='theme-color']");
      if (metaTag) {
        metaTag.setAttribute("content", color);
      } else {
        const newMeta = document.createElement("meta");
        newMeta.name = "theme-color";
        newMeta.content = color;
        document.head.appendChild(newMeta);
      }
    }
  }, [pathname, isDarkMode]);

  return (
    <html lang="en" className={isDarkMode ? "dark" : ""} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ffffff" />
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
