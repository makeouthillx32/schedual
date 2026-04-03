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

// Mirrors what DashboardThemeColorManager does — watches for mounted
// [data-layout] elements and reads their actual computed backgroundColor.
// This is the same technique that works in the dashboard.
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
      // Try app header first, then shop (home), then dashboard
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

    // Run immediately
    updateColor();

    // Watch for class/theme changes on <html> — same as dashboard
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
  const isToolsPage = pathname.toLowerCase().startsWith("/tools");
  const isDashboardPage = pathname.toLowerCase().startsWith("/dashboard");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const theme = localStorage.getItem("theme") || "light";
      setIsDarkMode(theme === "dark");
    }
  }, [pathname, isDarkMode]);

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

    const isAuthPage =
      pathname === "/sign-in" ||
      pathname === "/sign-up" ||
      pathname.startsWith("/auth");

    if (isAuthPage) return;
    if (isFirstLoad) { setIsFirstLoad(false); return; }

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