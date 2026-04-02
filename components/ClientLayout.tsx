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
      if (width < 768) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return screenSize;
}

function getCookieConsentVariant(screenSize: 'mobile' | 'tablet' | 'desktop') {
  switch (screenSize) {
    case 'mobile':
      return 'small';
    case 'tablet':
      return 'mini';
    case 'desktop':
    default:
      return 'default';
  }
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

  const isHome = pathname === "/";
  const isToolsPage = pathname.toLowerCase().startsWith("/tools");
  const isDashboardPage = pathname.toLowerCase().startsWith("/dashboard");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const theme = localStorage.getItem("theme") || "light";
      setIsDarkMode(theme === "dark");
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

    if (isAuthPage) return;

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
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const body = document.body;
      body.className = `min-h-screen font-[var(--font-sans)] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]`;
      
      const html = document.documentElement;
      if (isDarkMode) {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
    }
  }, [isDarkMode]);

  const showNav = !isHome && !isToolsPage && !isDashboardPage;
  const showFooter = !isHome && !isDashboardPage && !isToolsPage;
  const showAccessibility = !pathname.startsWith("/auth") && 
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
        onAcceptCallback={(preferences) => {
          console.log('✅ Cookies accepted:', preferences);
        }}
        onDeclineCallback={(preferences) => {
          console.log('🚫 Non-essential cookies declined:', preferences);
        }}
        onCustomizeCallback={(preferences) => {
          console.log('⚙️ Custom preferences saved:', preferences);
        }}
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