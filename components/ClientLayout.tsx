"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { setCookie } from "@/lib/cookieUtils";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import { useTheme } from "@/app/provider";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { themeType } = useTheme();
  const isDark = themeType === "dark";
  
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

  useEffect(() => {
    // Store the last page in cookie for navigation history
    const isAuthPage =
      pathname === "/sign-in" ||
      pathname === "/sign-up" ||
      pathname.startsWith("/auth");

    if (!isAuthPage) {
      setCookie("lastPage", pathname, { path: "/" });
    }

    // Set theme-color meta tag based on current theme and page
    if (typeof window !== "undefined") {
      const root = document.documentElement;
      let themeColor;

      if (pathname === "/") {
        // Home page uses different color scheme
        themeColor = isDark 
          ? getComputedStyle(root).getPropertyValue('--sidebar').trim()
          : getComputedStyle(root).getPropertyValue('--background').trim();
      } else {
        // Other pages
        themeColor = isDark 
          ? getComputedStyle(root).getPropertyValue('--background').trim()
          : getComputedStyle(root).getPropertyValue('--card').trim();
      }

      // Ensure the color is properly formatted
      if (!themeColor.startsWith('#') && !themeColor.startsWith('hsl') && !themeColor.startsWith('rgb')) {
        themeColor = isDark ? "hsl(var(--background))" : "hsl(var(--background))";
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
    }
  }, [pathname, isDark]);

  return (
    <div className={`min-h-screen flex flex-col ${
      isDark 
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
    analytics: "Analytics Dashboard"
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
