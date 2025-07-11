// app/provider.tsx (Enhanced with all layout logic)
“use client”;
import React, { createContext, useContext, useEffect, useState } from “react”;
import { createBrowserClient } from “@supabase/ssr”;
import type { Session, User } from “@supabase/auth-helpers-nextjs”;
import { SessionContextProvider, useSessionContext } from “@supabase/auth-helpers-react”;
import { setCookie, getCookie } from “@/lib/cookieUtils”;
import { usePathname, useRouter } from “next/navigation”;
import { Theme } from “@/types/theme”;
import { defaultThemeId, getThemeById, getAvailableThemeIds } from “@/themes”;
import { dynamicFontManager } from “@/lib/dynamicFontManager”;
import { transitionTheme, smoothThemeToggle } from “@/utils/themeTransitions”;
import analytics from “@/lib/analytics”;
import Nav from “@/components/nav”;
import Footer from “@/components/footer”;
import AccessibilityOverlay from “@/components/theme/accessibility”;

interface EnhancedThemeContextType {
themeType: “light” | “dark”;
toggleTheme: (element?: HTMLElement) => Promise<void>;
themeId: string;
setThemeId: (id: string, element?: HTMLElement) => Promise<void>;
getTheme: (id?: string) => Theme;
getAvailableThemes: () => { id: string; name: string }[];
previewTheme: (id: string, element?: HTMLElement) => Promise<void>;
confirmPreview: () => Promise<void>;
cancelPreview: () => Promise<void>;
isPreviewMode: boolean;
isTransitioning: boolean;
}

interface AppContextType {
user: User | null;
session: Session | null;
supabase: any;
isAuthLoading: boolean;
signOut: () => Promise<void>;
theme: EnhancedThemeContextType;
}

const EnhancedThemeContext = createContext<EnhancedThemeContextType | undefined>(undefined);
const AppContext = createContext<AppContextType | undefined>(undefined);

// Layout Provider - handles all the layout logic from your original layout
function LayoutProvider({ children }: { children: React.ReactNode }) {
const pathname = usePathname();
const [isDarkMode, setIsDarkMode] = useState(false);
const [isFirstLoad, setIsFirstLoad] = useState(true);

const isHome = pathname === “/”;
const isToolsPage = pathname.toLowerCase().startsWith(”/tools”);
const isDashboardPage = pathname.toLowerCase().startsWith(”/dashboard”);

// ✅ MOVED: All your theme and analytics logic from layout
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
<div className={`min-h-screen font-[var(--font-sans)] ${ isDarkMode  ? "bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"  : "bg-[hsl(var(--background))] text-[hsl(var(--foreground))]" }`}>
{showNav && <Nav />}
<main className="flex-1">{children}</main>
{showFooter && <Footer />}
{showAccessibility && <AccessibilityOverlay />}
</div>
);
}

// Enhanced Theme Provider (your existing theme logic)
function EnhancedThemeProvider({ children }: { children: React.ReactNode }) {
const [themeType, setThemeType] = useState<“light” | “dark”>(“light”);
const [themeId, setThemeIdState] = useState<string>(defaultThemeId);
const [isPreviewMode, setIsPreviewMode] = useState(false);
const [previewThemeId, setPreviewThemeId] = useState<string | null>(null);
const [originalThemeId, setOriginalThemeId] = useState<string | null>(null);
const [isTransitioning, setIsTransitioning] = useState(false);

// Load saved theme on mount
useEffect(() => {
if (typeof window !== “undefined”) {
const savedThemeType = getCookie(“theme-type”) || “light”;
const savedThemeId = getCookie(“theme-id”) || defaultThemeId;

```
  setThemeType(savedThemeType as "light" | "dark");
  setThemeIdState(savedThemeId);
  
  // Apply theme immediately
  document.documentElement.classList.toggle("dark", savedThemeType === "dark");
  applyTheme(savedThemeId);
}
```

}, []);

const applyTheme = (id: string) => {
const theme = getThemeById(id);
if (!theme) return;

```
const root = document.documentElement;

// Apply CSS variables
Object.entries(theme.cssVars).forEach(([key, value]) => {
  root.style.setProperty(key, value);
});

// Load custom fonts if needed
if (theme.fontFamily && theme.fontFamily !== "system") {
  dynamicFontManager.loadFont(theme.fontFamily);
}
```

};

const toggleTheme = async (element?: HTMLElement) => {
if (isTransitioning) return;

```
setIsTransitioning(true);
const newThemeType = themeType === "light" ? "dark" : "light";

try {
  if (element) {
    await smoothThemeToggle(element);
  }
  
  setThemeType(newThemeType);
  setCookie("theme-type", newThemeType, { path: "/", maxAge: 31536000 });
  document.documentElement.classList.toggle("dark", newThemeType === "dark");
  
} finally {
  setIsTransitioning(false);
}
```

};

const setThemeId = async (id: string, element?: HTMLElement) => {
if (isTransitioning || !getAvailableThemeIds().includes(id)) return;

```
setIsTransitioning(true);

try {
  if (element) {
    await transitionTheme(element, async () => {
      applyTheme(id);
    });
  } else {
    applyTheme(id);
  }
  
  setThemeIdState(id);
  setCookie("theme-id", id, { path: "/", maxAge: 31536000 });
  
} finally {
  setIsTransitioning(false);
}
```

};

const previewTheme = async (id: string, element?: HTMLElement) => {
if (isTransitioning || isPreviewMode) return;

```
setIsPreviewMode(true);
setOriginalThemeId(themeId);
setPreviewThemeId(id);

if (element) {
  await transitionTheme(element, async () => {
    applyTheme(id);
  });
} else {
  applyTheme(id);
}
```

};

const confirmPreview = async () => {
if (!previewThemeId) return;

```
setThemeIdState(previewThemeId);
setCookie("theme-id", previewThemeId, { path: "/", maxAge: 31536000 });
setIsPreviewMode(false);
setPreviewThemeId(null);
setOriginalThemeId(null);
```

};

const cancelPreview = async () => {
if (!originalThemeId) return;

```
applyTheme(originalThemeId);
setIsPreviewMode(false);
setPreviewThemeId(null);
setOriginalThemeId(null);
```

};

const getTheme = (id?: string) => {
const targetId = id || (isPreviewMode ? previewThemeId : themeId) || defaultThemeId;
return getThemeById(targetId);
};

const getAvailableThemes = () => {
return getAvailableThemeIds().map(id => ({
id,
name: getThemeById(id).name
}));
};

const contextValue: EnhancedThemeContextType = {
themeType,
toggleTheme,
themeId: isPreviewMode ? previewThemeId || themeId : themeId,
setThemeId,
getTheme,
getAvailableThemes,
previewTheme,
confirmPreview,
cancelPreview,
isPreviewMode,
isTransitioning
};

return (
<EnhancedThemeContext.Provider value={contextValue}>
<LayoutProvider>
{children}
</LayoutProvider>
</EnhancedThemeContext.Provider>
);
}

// Auth Provider (your existing auth logic)
function AuthProvider({ children }: { children: React.ReactNode }) {
const [supabase] = useState(() => createBrowserClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
));

return (
<SessionContextProvider supabaseClient={supabase}>
<AuthContextProvider>
{children}
</AuthContextProvider>
</SessionContextProvider>
);
}

function AuthContextProvider({ children }: { children: React.ReactNode }) {
const { session, isLoading } = useSessionContext();
const [user, setUser] = useState<User | null>(null);
const router = useRouter();
const pathname = usePathname();

useEffect(() => {
if (session?.user) {
setUser(session.user);
} else {
setUser(null);
}
}, [session]);

const signOut = async () => {
const supabase = createBrowserClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

```
await supabase.auth.signOut();
setUser(null);
router.push('/sign-in');
```

};

const contextValue: AppContextType = {
user,
session,
supabase: createBrowserClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
),
isAuthLoading: isLoading,
signOut,
theme: useEnhancedTheme(),
};

return (
<AppContext.Provider value={contextValue}>
{children}
</AppContext.Provider>
);
}

// Main Providers component
export function Providers({ children }: { children: React.ReactNode }) {
return (
<EnhancedThemeProvider>
<AuthProvider>
{children}
</AuthProvider>
</EnhancedThemeProvider>
);
}

// Hooks
export function useEnhancedTheme() {
const context = useContext(EnhancedThemeContext);
if (context === undefined) {
throw new Error(“useEnhancedTheme must be used within an EnhancedThemeProvider”);
}
return context;
}

export function useApp() {
const context = useContext(AppContext);
if (context === undefined) {
throw new Error(“useApp must be used within an AppProvider”);
}
return context;
}

// ✅ Helper functions to convert colors (moved from layout)
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