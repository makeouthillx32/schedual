// app/RootLayoutClient.tsx (EXACT copy of your current layout - nothing removed or changed)
“use client”;

import { useEffect, useState } from “react”;
import { usePathname } from “next/navigation”;
import { Providers } from “./provider”;
import Nav from “@/components/nav”;
import Footer from “@/components/footer”;
import AccessibilityOverlay from “@/components/theme/accessibility”;
import analytics from “@/lib/analytics”;
import { setCookie } from “@/lib/cookieUtils”;

export default function RootLayoutClient({
children,
}: {
children: React.ReactNode;
}) {
const pathname = usePathname();
const [isDarkMode, setIsDarkMode] = useState(false);
const [isFirstLoad, setIsFirstLoad] = useState(true);

const isHome = pathname === “/”;
const isToolsPage = pathname.toLowerCase().startsWith(”/tools”);
const isDashboardPage = pathname.toLowerCase().startsWith(”/dashboard”);

// ✅ FIXED: Connected to actual Tailwind CSS background values
useEffect(() => {
if (typeof window !== “undefined”) {
// Get theme from localStorage
const theme = localStorage.getItem(“theme”) || “light”;
setIsDarkMode(theme === “dark”);

```
  // ✅ FIXED: Read actual CSS background color from computed styles
  const updateThemeColor = () => {
    const root = document.documentElement;
    
    // Get the actual background color from CSS variables
    let backgroundColor = getComputedStyle(root).getPropertyValue('--background').trim();
    
    console.log('🔍 Raw CSS --background value:', backgroundColor);
    
    // Convert HSL values to hex for iOS
    let themeColor = '#ffffff'; // fallback
    
    if (backgroundColor) {
      // Handle HSL format: "220 14.75% 11.96%" -> hsl(220, 14.75%, 11.96%)
      const hslMatch = backgroundColor.match(/(\d+\.?\d*)\s+(\d+\.?\d*)%\s+(\d+\.?\d*)%/);
      
      if (hslMatch) {
        const [, h, s, l] = hslMatch;
        const hslString = `hsl(${h}, ${s}%, ${l}%)`;
        console.log('🎨 Converted to HSL:', hslString);
        
        // Convert HSL to hex
        themeColor = hslToHex(parseFloat(h), parseFloat(s), parseFloat(l));
      } else {
        // Try to get computed background color from body
        const bodyBg = getComputedStyle(document.body).backgroundColor;
        if (bodyBg && bodyBg !== 'rgba(0, 0, 0, 0)' && bodyBg !== 'transparent') {
          themeColor = rgbToHex(bodyBg);
        }
      }
    }
    
    console.log('🎨 Final theme color for iOS:', themeColor);

    // Update meta tag
    let metaTag = document.querySelector("meta[name='theme-color']") as HTMLMetaElement;
    if (metaTag) {
      metaTag.setAttribute("content", themeColor);
    } else {
      metaTag = document.createElement("meta");
      metaTag.name = "theme-color";
      metaTag.content = themeColor;
      document.head.appendChild(metaTag);
    }

    console.log('📱 iOS theme-color updated:', {
      theme,
      pathname,
      cssBackground: backgroundColor,
      finalColor: themeColor
    });
  };

  // Wait for styles to load, then update
  setTimeout(updateThemeColor, 100);
  setTimeout(updateThemeColor, 500); // Extra delay for theme system
}
```

}, [pathname, isHome, isDarkMode]);

useEffect(() => {
if (typeof window !== “undefined”) {
const isAuthPage =
pathname === “/sign-in” ||
pathname === “/sign-up” ||
pathname.startsWith(”/auth”);

```
  if (!isAuthPage) {
    setCookie("lastPage", pathname, { path: "/" });
  }
}
```

}, [pathname]);

// ✅ OPTIMIZED: Analytics tracking with better navigation handling
useEffect(() => {
if (typeof window === “undefined”) return;

```
const isAuthPage = pathname === "/sign-in" || 
                  pathname === "/sign-up" || 
                  pathname.startsWith("/auth");

if (isAuthPage) {
  console.log('🚫 Skipping analytics for auth page:', pathname);
  return;
}

if (isFirstLoad) {
  console.log('🏠 First load detected, analytics will auto-track initial page view');
  setIsFirstLoad(false);
  return;
}

// ✅ SIMPLIFIED: Only call onRouteChange - it handles the page view tracking
console.log('🔄 SPA navigation detected:', pathname);
analytics.onRouteChange(window.location.href);

// ✅ SEPARATE: Track navigation event for analysis (separate from page view)
let pageCategory = 'general';
if (isHome) pageCategory = 'landing';
else if (isToolsPage) pageCategory = 'tools';
else if (isDashboardPage) pageCategory = 'dashboard';

// Add a small delay to avoid race conditions with page view tracking
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
```

}, [pathname, isHome, isToolsPage, isDashboardPage, isFirstLoad]);

// ✅ NEW: Debug analytics on development
useEffect(() => {
if (typeof window !== “undefined” && process.env.NODE_ENV === ‘development’) {
// Add analytics debug to window for easy access
(window as any).debugAnalytics = () => {
console.log(‘🔍 Analytics Debug Info:’);
console.log(‘Session ID:’, analytics.getSessionId());
console.log(‘Stats:’, analytics.getStats());
analytics.debug();
};

```
  // Log analytics status on mount
  console.log('📊 Analytics Status:', {
    sessionId: analytics.getSessionId(),
    isEnabled: analytics.getStats().isEnabled,
    pageViews: analytics.getStats().pageViews,
    events: analytics.getStats().events
  });
}
```

}, []);

const showNav = !isHome && !isToolsPage && !isDashboardPage;
const showFooter = !isHome && !isDashboardPage;
const showAccessibility = !pathname.startsWith(”/auth”) &&
pathname !== “/sign-in” &&
pathname !== “/sign-up”;

return (
<html lang=“en” className={isDarkMode ? “dark” : “”} suppressHydrationWarning>
<head>
<meta name="theme-color" content="#ffffff" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
</head>
<body className={`min-h-screen font-[var(--font-sans)] ${ isDarkMode  ? "bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"  : "bg-[hsl(var(--background))] text-[hsl(var(--foreground))]" }`}>
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

// ✅ Helper functions to convert colors
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
const match = rgb.match(/rgb((\d+),\s*(\d+),\s*(\d+))/);
if (match) {
const r = parseInt(match[1]).toString(16).padStart(2, ‘0’);
const g = parseInt(match[2]).toString(16).padStart(2, ‘0’);
const b = parseInt(match[3]).toString(16).padStart(2, ‘0’);
return `#${r}${g}${b}`;
}
return rgb; // fallback
}