"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Providers } from "./provider";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import AccessibilityOverlay from "@/components/theme/accessibility";
import "./globals.css";
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
  const isDashboardPage = pathname.toLowerCase().startsWith("/dashboard");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuthPage =
        pathname === "/sign-in" ||
        pathname === "/sign-up" ||
        pathname.startsWith("/auth");

      if (!isAuthPage) {
        setCookie("lastPage", pathname, { path: "/" });
      }

      // Get theme from localStorage
      const theme = localStorage.getItem("theme") || "light";
      setIsDarkMode(theme === "dark");

      // Set theme-color meta tag based on CSS variables
      const root = document.documentElement;
      let themeColor;

      if (isHome) {
        themeColor = theme === "dark" 
          ? getComputedStyle(root).getPropertyValue('--sidebar').trim() // Use sidebar color for home dark
          : getComputedStyle(root).getPropertyValue('--background').trim(); // Use background color for home light
      } else {
        themeColor = theme === "dark" 
          ? getComputedStyle(root).getPropertyValue('--background').trim()
          : getComputedStyle(root).getPropertyValue('--background').trim();
      }

      // Ensure the color is in proper format
      if (!themeColor.startsWith('#') && !themeColor.startsWith('hsl') && !themeColor.startsWith('rgb')) {
        // Default fallbacks if variables aren't properly formatted
        themeColor = theme === "dark" ? "hsl(var(--background))" : "hsl(var(--background))";
      }

      // Update meta tag
      const metaTag = document.querySelector("meta[name='theme-color']");
      if (metaTag) {
        metaTag.setAttribute("content", themeColor);
      } else {
        const newMeta = document.createElement("meta");
        newMeta.name = "theme-color";
        newMeta.content = themeColor;
        document.head.appendChild(newMeta);
      }
    }
  }, [pathname, isHome]);

  const showNav = !isHome && !isToolsPage && !isDashboardPage;
  const showFooter = !isHome && !isDashboardPage;
  // Show accessibility on all pages except auth pages
  const showAccessibility = !pathname.startsWith("/auth") && 
                            pathname !== "/sign-in" && 
                            pathname !== "/sign-up";

  return (
    <html lang="en" className={isDarkMode ? "dark" : ""} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ffffff" />
        {/* Only preconnect to Google Fonts - fonts will be loaded dynamically by theme system */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* REMOVED: Hardcoded Google Fonts link - fonts now loaded dynamically by theme */}
      </head>
      <body className={`min-h-screen font-[var(--font-sans)] ${
        isDarkMode 
          ? "bg-[hsl(var(--background))] text-[hsl(var(--foreground))]" 
          : "bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
      }`}>
        <Providers>
          {showNav && <Nav />}
          <main className="flex-1">{children}</main>
          {showFooter && <Footer />}
          {showAccessibility && <AccessibilityOverlay />}
        </Providers>
      </body>
    </html>
  );
}