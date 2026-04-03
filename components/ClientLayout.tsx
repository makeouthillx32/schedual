"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import { Sidebar } from "@/components/Layouts/sidebar";
import { Header } from "@/components/Layouts/header";
import AccessibilityOverlay from "@/components/theme/accessibility";
import { CookieConsent } from "@/components/CookieConsent";
import analytics from "@/lib/analytics";
import { setCookie } from "@/lib/cookieUtils";

function useScreenSize() {
  const [screenSize, setScreenSize] = useState<"mobile" | "tablet" | "desktop">("desktop");
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      if (w < 768) setScreenSize("mobile");
      else if (w < 1024) setScreenSize("tablet");
      else setScreenSize("desktop");
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return screenSize;
}

function getCookieConsentVariant(s: "mobile" | "tablet" | "desktop") {
  if (s === "mobile") return "small";
  if (s === "tablet") return "mini";
  return "default";
}

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

    const observer = new MutationObserver(() => setTimeout(updateColor, 50));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "style"],
    });

    return () => observer.disconnect();
  }, [pathname]);
}

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const screenSize = useScreenSize();
  const cookieVariant = getCookieConsentVariant(screenSize);

  useLayoutThemeColor();

  const isHome = pathname === "/";
  const isToolsPage = pathname.startsWith("/Tools");
  const isDashboardPage = pathname.startsWith("/dashboard");
  const isAuthPage =
    pathname.startsWith("/auth") ||
    pathname === "/sign-in" ||
    pathname === "/sign-up";

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsDarkMode(localStorage.getItem("theme") === "dark");
    }
  }, []);

  useEffect(() => {
    if (!isFirstLoad) return;
    setIsFirstLoad(false);
    const pageCategory = isHome ? "home" : isDashboardPage ? "dashboard" : isToolsPage ? "tools" : "app";
    setTimeout(() => {
      analytics.trackPageView(pathname, {
        metadata: { pathname, from: document.referrer || "direct", pageType: pageCategory, timestamp: Date.now() },
      });
    }, 100);
  }, [pathname, isHome, isToolsPage, isDashboardPage, isFirstLoad]);

  useEffect(() => {
    if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
      (window as any).debugAnalytics = () => {
        console.log("Session ID:", analytics.getSessionId());
        console.log("Stats:", analytics.getStats());
        analytics.debug();
      };
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.body.className = `min-h-screen font-[var(--font-sans)] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]`;
      const html = document.documentElement;
      if (isDarkMode) html.classList.add("dark");
      else html.classList.remove("dark");
    }
  }, [isDarkMode]);

  if (isDashboardPage) {
    return (
      <>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
            <Header />
            <main className="mx-auto w-full max-w-screen-2xl p-4 md:p-6 2xl:p-10">
              {children}
            </main>
          </div>
        </div>
        {!isAuthPage && <AccessibilityOverlay />}
      </>
    );
  }

  return (
    <>
      {!isHome && !isToolsPage && <Nav />}
      <main className="flex-1">{children}</main>
      {!isHome && !isToolsPage && <Footer />}
      {!isAuthPage && <AccessibilityOverlay />}
      <CookieConsent
        variant={cookieVariant}
        showCustomize={screenSize !== "mobile"}
        description={
          screenSize === "mobile"
            ? "We use cookies to enhance your experience. Essential cookies are required for functionality."
            : screenSize === "tablet"
            ? "We use cookies to enhance your experience and analyze usage. Essential cookies required."
            : "We use cookies to enhance your experience, analyze site usage, and improve our services. Essential cookies are required for basic functionality."
        }
        learnMoreHref="/privacy-policy"
        onAcceptCallback={(p) => console.log("✅ Cookies accepted:", p)}
        onDeclineCallback={(p) => console.log("🚫 Cookies declined:", p)}
        onCustomizeCallback={(p) => console.log("⚙️ Custom preferences:", p)}
      />
      {process.env.NODE_ENV === "development" && (
        <div className="fixed top-4 right-4 bg-black/80 text-white text-xs p-2 rounded z-[60] pointer-events-none">
          Screen: {screenSize} | Variant: {cookieVariant}
        </div>
      )}
    </>
  );
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; } else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; } else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; } else { r = c; b = x; }
  r = Math.round((r + m) * 255); g = Math.round((g + m) * 255); b = Math.round((b + m) * 255);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function rgbToHex(rgb: string): string {
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (match) return `#${parseInt(match[1]).toString(16).padStart(2, "0")}${parseInt(match[2]).toString(16).padStart(2, "0")}${parseInt(match[3]).toString(16).padStart(2, "0")}`;
  return rgb;
}