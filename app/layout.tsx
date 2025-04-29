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

  const excludeGlobalLayout =
    pathname === "/" || pathname?.startsWith("/Tools");

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

      // 🛠 Correct dynamic meta theme-color setup
      let color = "#ffffff"; // Default light mode home color

      if (pathname === "/" || pathname.startsWith("/Tools")) {
        // Landing page or Tools
        color = isDarkMode ? "#111827" : "#f9fafb"; 
      } else {
        // CMS or inside App
        color = isDarkMode ? "#111827" : "#ffffff"; 
      }

      // Update meta tag
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
        {/* Static fallback for iOS devices without JS */}
        <meta name="theme-color" content="#ff0000" />
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
