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
import { useTheme } from "@/app/provider";
import { useMetaThemeColor } from "@/components/Layouts/hooks/useMetaThemeColor";

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

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { themeType } = useTheme();
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const screenSize = useScreenSize();
  const cookieVariant = getCookieConsentVariant(screenSize);

  const isHome = pathname === "/";
  const isToolsPage = pathname.startsWith("/Tools");
  const isDashboardPage = pathname.startsWith("/dashboard");
  const isAuthPage =
    pathname.startsWith("/auth") ||
    pathname === "/sign-in" ||
    pathname === "/sign-up";

  // Determine which layout's header is visible so the hook targets the right element
  const metaLayout = isDashboardPage ? "dashboard" : isHome ? "shop" : "app";

  // Single source of truth for iOS status bar — matches DCG architecture
  useMetaThemeColor(metaLayout, themeType);

  useEffect(() => {
    if (!isFirstLoad) return;
    setIsFirstLoad(false);
    const pageCategory = isHome ? "home" : isDashboardPage ? "dashboard" : isToolsPage ? "tools" : "app";
    setTimeout(() => {
      analytics.trackPageView(pathname);
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