"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import AccessibilityOverlay from "@/components/theme/accessibility";
import { CookieConsent } from "@/components/CookieConsent";
import analytics from "@/lib/analytics";
import { setCookie } from "@/lib/cookieUtils";

function useScreenSize() {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      if (width < 768) setScreenSize('mobile');
      else if (width < 1024) setScreenSize('tablet');
      else setScreenSize('desktop');
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return screenSize;
}

function getCookieConsentVariant(screenSize: 'mobile' | 'tablet' | 'desktop') {
  switch (screenSize) {
    case 'mobile': return 'small';
    case 'tablet': return 'mini';
    default: return 'default';
  }
}

// Single source of truth for iOS status bar color.
// Reads getComputedStyle(el).backgroundColor from the live [data-layout] header element —
// same technique DashboardThemeColorManager uses (the one that actually works).
// MutationObserver re-fires on any class/style change to <html> so theme switches update instantly.
function useLayoutThemeColor() {
  const pathname = usePathname();

  useEffect(() => {
    const setMetaColor = (color: string) => {
      let meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "theme-color");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", color);
    };

    const updateColor = () => {
      const el =
        document.querySelector('[data-layout="app"]') ||
        document.querySelector('[data-layout="shop"]') ||
        document.querySelector('[data-layout="dashboard"]');

      if (!el) return;

      const bg = getComputedStyle(el).backgroundColor;
      if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
        setMetaColor(bg);
      }
    };

    updateColor();

    const observer = new MutationObserver(() => {
      setTimeout(updateColor, 50);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme', 'style'],
    });

    return () => observer.disconnect();
  }, [pathname]);
}

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const screenSize = useScreenSize();
  const cookieVariant = getCookieConsentVariant(screenSize);

  useLayoutThemeColor();

  const isHome = pathname === "/";
  const isToolsPage = pathname.startsWith("/Tools");
  const isDashboardPage = pathname.startsWith("/dashboard");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      setIsDarkMode(savedTheme === "dark");
    }
  }, []);

  useEffect(() => {
    if (!isFirstLoad) return;
    setIsFirstLoad(false);

    const pageCategory =
      isHome ? 'home' :
      isDashboardPage ? 'dashboard' :
      isToolsPage ? 'tools' : 'app';

    setTimeout(() => {
      analytics.trackPageView(pathname, {
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
        console.log('Session ID:', analytics.getSessionId());
        console.log('Stats:', analytics.getStats());
        analytics.debug();
      };
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.body.className = `min-h-screen font-[var(--font-sans)] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]`;
      const html = document.documentElement;
      if (isDarkMode) html.classList.add('dark');
      else html.classList.remove('dark');
    }
  }, [isDarkMode]);

  const showNav = !isHome && !isToolsPage && !isDashboardPage;
  const showFooter = !isHome && !isDashboardPage && !isToolsPage;
  const showAccessibility =
    !pathname.startsWith("/auth") &&
    pathname !== "/sign-in" &&
    pathname !== "/sign-up";

  return (
    <>
      {showNav && <Nav />}
      <main className="flex-1">{children}</main>
      {showFooter && <Footer />}
      {showAccessibility && <AccessibilityOverlay />}

      <CookieConsent
        variant={cookieVariant}
        showCustomize={screenSize !== 'mobile'}
        description={
          screenSize === 'mobile'
            ? "We use cookies to enhance your experience. Essential cookies are required for functionality."
            : screenSize === 'tablet'
            ? "We use cookies to enhance your experience and analyze usage. Essential cookies required."
            : "We use cookies to enhance your experience, analyze site usage, and improve our services. Essential cookies are required for basic functionality."
        }
        learnMoreHref="/privacy-policy"
        onAcceptCallback={(preferences) => console.log('✅ Cookies accepted:', preferences)}
        onDeclineCallback={(preferences) => console.log('🚫 Cookies declined:', preferences)}
        onCustomizeCallback={(preferences) => console.log('⚙️ Custom preferences:', preferences)}
      />

      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 bg-black/80 text-white text-xs p-2 rounded z-[60] pointer-events-none">
          Screen: {screenSize} | Variant: {cookieVariant}
        </div>
      )}
    </>
  );
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (0 <= h && h < 60) { r = c; g = x; b = 0; }
  else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
  else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
  else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
  else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
  else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
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