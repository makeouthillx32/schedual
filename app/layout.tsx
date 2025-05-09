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

  const isHome = pathname === "/";
  const isToolsPage = pathname.toLowerCase().startsWith("/tools");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuthPage =
        pathname === "/sign-in" ||
        pathname === "/sign-up" ||
        pathname.startsWith("/auth");

      if (!isAuthPage) {
        setCookie("lastPage", pathname, { path: "/" });
      }

      const theme = localStorage.getItem("theme") || "light";
      setIsDarkMode(theme === "dark");

      const computedStyle = getComputedStyle(document.documentElement);
      let color = "#ffffff"; // fallback

      if (isHome) {
        color = theme === "dark"
          ? computedStyle.getPropertyValue("--home-nav-bg")?.trim() || "#2d3142"
          : computedStyle.getPropertyValue("--home-nav-bg")?.trim() || "#ffffff";
      } else {
        color = theme === "dark"
          ? computedStyle.getPropertyValue("--hnf-background")?.trim() || "#111827"
          : computedStyle.getPropertyValue("--hnf-background")?.trim() || "#f9fafb";
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
  }, [pathname, isHome]);

  // hide Nav/Footer on home or any /tools/* page
  const excludeGlobalLayout = isHome || isToolsPage;

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