"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Providers } from "./provider";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import AccessibilityOverlay from "@/components/theme/accessibility";
import analytics from "@/lib/analytics";
import "./globals.css";
import { setCookie } from "@/lib/cookieUtils";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

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
          ? getComputedStyle(root).getPropertyValue('--sidebar').trim()
          : getComputedStyle(root).getPropertyValue('--background').trim();
      } else {
        themeColor = theme === "dark" 
          ? getComputedStyle(root).getPropertyValue('--background').trim()
          : getComputedStyle(root).getPropertyValue('--background').trim();
      }

      // Ensure the color is in proper format
      if (!themeColor.startsWith('#') && !themeColor.startsWith('hsl') && !themeColor.startsWith('rgb')) {
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

  // Analytics: Handle SPA navigation (skip first load to avoid double tracking)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const isAuthPage = pathname === "/sign-in" || 
                      pathname === "/sign-up" || 
                      pathname.startsWith("/auth");

    if (isAuthPage) {
      console.log('🚫 Skipping analytics for auth page:', pathname);
      return;
    }

    // Skip tracking on first load (analytics auto-initializes and tracks first page view)
    if (isFirstLoad) {
      console.log('🏠 First load detected, analytics will auto-track initial page view');
      setIsFirstLoad(false);
      return;
    }

    // Track subsequent navigation (SPA route changes)
    console.log('🔄 SPA navigation detected:', pathname);
    analytics.onRouteChange(window.location.href);
    
    // Track page category for navigation events
    let pageCategory = 'general';
    if (isHome) pageCategory = 'landing';
    else if (isToolsPage) pageCategory = 'tools';
    else if (isDashboardPage) pageCategory = 'dashboard';
    
    analytics.trackEvent('spa_navigation', {
      category: 'navigation',
      action: 'route_change',
      label: pageCategory,
      metadata: {
        pathname,
        from: document.referrer || 'direct',
        pageType: pageCategory
      }
    });

  }, [pathname, isHome, isToolsPage, isDashboardPage, isFirstLoad]);

  const showNav = !isHome && !isToolsPage && !isDashboardPage;
  const showFooter = !isHome && !isDashboardPage;
  const showAccessibility = !pathname.startsWith("/auth") && 
                            pathname !== "/sign-in" && 
                            pathname !== "/sign-up";

  return (
    <html lang="en" className={isDarkMode ? "dark" : ""} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ffffff" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
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