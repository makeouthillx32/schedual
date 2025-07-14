// components/ClientLayout.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import analytics from "@/lib/analytics";
import { setCookie } from "@/lib/cookieUtils";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const isHome = pathname === "/";
  const isToolsPage = pathname.toLowerCase().startsWith("/tools");
  const isDashboardPage = pathname.toLowerCase().startsWith("/dashboard");

  // Theme detection and meta tag updates
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Store the last page in cookie for navigation history
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

      // Update theme-color meta tag
      const updateThemeColor = () => {
        const root = document.documentElement;
        let backgroundColor = getComputedStyle(root).getPropertyValue('--background').trim();
        
        let themeColor = '#ffffff'; // fallback
        
        if (backgroundColor) {
          // Handle HSL format: "220 14.75% 11.96%" -> hsl(220, 14.75%, 11.96%)
          const hslMatch = backgroundColor.match(/(\d+\.?\d*)\s+(\d+\.?\d*)%\s+(\d+\.?\d*)%/);
          if (hslMatch) {
            const [, h, s, l] = hslMatch;
            themeColor = `hsl(${h}, ${s}%, ${l}%)`;
          }
        }

        // Update the meta tag
        const metaTag = document.querySelector("meta[name='theme-color']");
        if (metaTag) {
          metaTag.setAttribute("content", themeColor);
        } else {
          const newMeta = document.createElement("meta");
          newMeta.name = "theme-color";
          newMeta.content = themeColor;
          document.head.appendChild(newMeta);
        }
      };

      updateThemeColor();

      // Track page view
      analytics.track('page_view', {
        page_path: pathname,
        page_title: document.title,
      });
    }
  }, [pathname, isDarkMode]);

  // Pages that should exclude the global layout (nav and footer)
  const excludeGlobalLayout = [
    "/",
    "/dashboard",
    "/dashboard/me"
  ].includes(pathname) || pathname.startsWith("/dashboard/");
  
  // Pages that should exclude only the footer
  const excludeFooter = [
    "/settings",
    "/profile"
  ].includes(pathname);

  return (
    <div className={`min-h-screen flex flex-col ${
      isDarkMode 
        ? "bg-[hsl(var(--background))] text-[hsl(var(--foreground))]" 
        : "bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
    }`}>
      {!excludeGlobalLayout && <Nav pageTitle={getPageTitle(pathname)} />}
      <main className="flex-1">{children}</main>
      {!excludeGlobalLayout && !excludeFooter && <Footer />}
    </div>
  );
}

// Helper function to generate page titles based on the current path
function getPageTitle(pathname: string): string {
  const path = pathname.split("/").filter(Boolean);
  
  if (path.length === 0) return "";
  
  const mainSection = path[0];
  const subSection = path.length > 1 ? path[1] : "";
  
  const titles: Record<string, string | Record<string, string>> = {
    schedule: "Cleaning Schedule",
    tools: {
      "timesheet-calculator": "Timesheet Calculator",
      default: "Tools"
    },
    settings: "Settings",
    profile: "Your Profile",
    analytics: "Analytics Dashboard",
    punchcards: "Punch Card Maker",
    CMS: "CMS Schedule App",
    website: "Website Builder"
  };
  
  const mainTitle = titles[mainSection];
  
  if (typeof mainTitle === "string") {
    return mainTitle;
  } else if (mainTitle && typeof mainTitle === "object") {
    return mainTitle[subSection] || mainTitle.default;
  }
  
  // Capitalize the path as fallback
  return mainSection.charAt(0).toUpperCase() + mainSection.slice(1);
}