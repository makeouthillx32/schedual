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
      const theme = localStorage.getItem("theme") || "light";
      setIsDarkMode(theme === "dark");

      const updateThemeColor = () => {
        const root = document.documentElement;
        let backgroundColor = getComputedStyle(root).getPropertyValue('--background').trim();
        let themeColor = '#ffffff';

        const hslMatch = backgroundColor.match(/(\d+\.?\d*)\s+(\d+\.?\d*)%\s+(\d+\.?\d*)%/);
        if (hslMatch) {
          const [, h, s, l] = hslMatch;
          themeColor = hslToHex(parseFloat(h), parseFloat(s), parseFloat(l));
        } else {
          const bodyBg = getComputedStyle(document.body).backgroundColor;
          if (bodyBg && bodyBg !== 'rgba(0, 0, 0, 0)' && bodyBg !== 'transparent') {
            themeColor = rgbToHex(bodyBg);
          }
        }

        let metaTag = document.querySelector("meta[name='theme-color']") as HTMLMetaElement;
        if (metaTag) {
          metaTag.setAttribute("content", themeColor);
        } else {
          metaTag = document.createElement("meta");
          metaTag.name = "theme-color";
          metaTag.content = themeColor;
          document.head.appendChild(metaTag);
        }
      };

      setTimeout(updateThemeColor, 100);
      setTimeout(updateThemeColor, 500);
    }
  }, [pathname, isHome, isDarkMode]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuthPage =
        pathname === "/sign-in" ||
        pathname === "/sign-up" ||
        pathname.startsWith("/auth");

      if (!isAuthPage) {
        setCookie("lastPage", pathname, { path: "/" });
      }
    }
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isAuthPage = pathname === "/sign-in" || 
                      pathname === "/sign-up" || 
                      pathname.startsWith("/auth");

    if (isAuthPage) {
      return;
    }

    if (isFirstLoad) {
      setIsFirstLoad(false);
      return;
    }

    analytics.onRouteChange(window.location.href);

    let pageCategory = 'general';
    if (isHome) pageCategory = 'landing';
    else if (isToolsPage) pageCategory = 'tools';
    else if (isDashboardPage) pageCategory = 'dashboard';

    setTimeout(() => {
      analytics.trackEvent('navigation', {
        category: 'user_flow',
        action: 'page_change',
        label: pageCategory,
        metadata: {
          pathname,
          from: document.referrer || 'direct',
          pageType: pageCategory,
          timestamp: Date.now()
        }
      });
    }, 100);

  }, [pathname, isHome, isToolsPage, isDashboardPage, isFirstLoad]);

  useEffect(() => {
    if (typeof window !== "undefined" && process.env.NODE_ENV === 'development') {
      (window as any).debugAnalytics = () => {
        console.log('🔍 Analytics Debug Info:');
        console.log('Session ID:', analytics.getSessionId());
        console.log('Stats:', analytics.getStats());
        analytics.debug();
      };

      console.log('📊 Analytics Status:', {
        sessionId: analytics.getSessionId(),
        isEnabled: analytics.getStats().isEnabled,
        pageViews: analytics.getStats().pageViews,
        events: analytics.getStats().events
      });
    }
  }, []);

  const showNav = !isHome && !isToolsPage && !isDashboardPage;
  const showFooter = !isHome && !isDashboardPage;
  const showAccessibility = !pathname.startsWith("/auth") && 
                            pathname !== "/sign-in" && 
                            pathname !== "/sign-up";

  return (
    <html lang="en" className={isDarkMode ? "dark" : ""} suppressHydrationWarning>
      {/* ✅ This <head /> enables route-specific metadata like for /punchcards */}
      <head />
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

// ✅ Color helpers (unchanged)
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function rgbToHex(rgb: string): string {
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (match) {
    const r = parseInt(match[1]).toString(16).padStart(2, '0');
    const g = parseInt(match[2]).toString(16).padStart(2, '0');
    const b = parseInt(match[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }
  return rgb;
}