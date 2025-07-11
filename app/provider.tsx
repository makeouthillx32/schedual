"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { Session, User } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider, useSessionContext } from "@supabase/auth-helpers-react";
import { setCookie, getCookie } from "@/lib/cookieUtils";
import { usePathname, useRouter } from "next/navigation";
import { Theme } from "@/types/theme"; 
import { defaultThemeId, getThemeById, getAvailableThemeIds } from "@/themes";
import { dynamicFontManager } from "@/lib/dynamicFontManager";
import { transitionTheme, smoothThemeToggle } from "@/utils/themeTransitions";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import AccessibilityOverlay from "@/components/theme/accessibility";
import analytics from "@/lib/analytics";

interface EnhancedThemeContextType {
  themeType: "light" | "dark";
  toggleTheme: (element?: HTMLElement) => Promise<void>;
  themeId: string;
  setThemeId: (id: string, element?: HTMLElement) => Promise<void>;
  getTheme: (id?: string) => Promise<Theme | null>;
  availableThemes: string[];
}

const ThemeContext = createContext<EnhancedThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

function InternalAuthProvider({ children }: { children: React.ReactNode }) {
  const { supabaseClient, session, isLoading } = useSessionContext();
  const user = session?.user || null;
  const pathname = usePathname();
  const router = useRouter();
  const protectedPaths = ["/dashboard", "/dashboard/me"];
  
  useEffect(() => {
    const isProtected = protectedPaths.some((path) => pathname?.startsWith(path));
    if (!isLoading && isProtected && !user) {
      router.push("/sign-in");
    }
  }, [isLoading, user, pathname, router]);
  
  async function signIn(email: string, password: string) {
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) console.error("Sign-in error:", error.message);
  }
  
  async function signOut() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) console.error("Sign-out error:", error.message);
    else router.push("/");
  }
  
  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

// Layout Logic Component - moved from your old layout
function LayoutManager({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const isHome = pathname === "/";
  const isToolsPage = pathname.toLowerCase().startsWith("/tools");
  const isDashboardPage = pathname.toLowerCase().startsWith("/dashboard");

  // All your existing useEffect logic from layout
  useEffect(() => {
    if (typeof window !== "undefined") {
      const theme = localStorage.getItem("theme") || "light";
      setIsDarkMode(theme === "dark");

      const updateThemeColor = () => {
        const root = document.documentElement;
        
        let backgroundColor = getComputedStyle(root).getPropertyValue('--background').trim();
        
        console.log('🔍 Raw CSS --background value:', backgroundColor);
        
        let themeColor = '#ffffff';
        
        if (backgroundColor) {
          const hslMatch = backgroundColor.match(/(\d+\.?\d*)\s+(\d+\.?\d*)%\s+(\d+\.?\d*)%/);
          
          if (hslMatch) {
            const [, h, s, l] = hslMatch;
            const hslString = `hsl(${h}, ${s}%, ${l}%)`;
            console.log('🎨 Converted to HSL:', hslString);
            
            themeColor = hslToHex(parseFloat(h), parseFloat(s), parseFloat(l));
          } else {
            const bodyBg = getComputedStyle(document.body).backgroundColor;
            if (bodyBg && bodyBg !== 'rgba(0, 0, 0, 0)' && bodyBg !== 'transparent') {
              themeColor = rgbToHex(bodyBg);
            }
          }
        }
        
        console.log('🎨 Final theme color for iOS:', themeColor);

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
      console.log('🚫 Skipping analytics for auth page:', pathname);
      return;
    }

    if (isFirstLoad) {
      console.log('🏠 First load detected, analytics will auto-track initial page view');
      setIsFirstLoad(false);
      return;
    }

    console.log('🔄 SPA navigation detected:', pathname);
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
    <div className={`min-h-screen font-[var(--font-sans)] ${
      isDarkMode 
        ? "bg-[hsl(var(--background))] text-[hsl(var(--foreground))]" 
        : "bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
    }`}>
      {showNav && <Nav />}
      <main className="flex-1">{children}</main>
      {showFooter && <Footer />}
      {showAccessibility && <AccessibilityOverlay />}
    </div>
  );
}

function logThemeInfo(themeId: string, themeType: "light" | "dark") {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  const getVar = (name: string) => getComputedStyle(root).getPropertyValue(name).trim();
  const fontSans = getVar('--font-sans');
  const background = getVar('--background');
  const primary = getVar('--primary');
  const radius = getVar('--radius');
  const loadedFonts = dynamicFontManager.getLoadedFonts();
  
  console.log(
    "%cTheme Inspector%c\n\n" + 
    "Theme ID: %c" + themeId + "%c\n" +
    "Theme Mode: %c" + themeType + "%c\n\n" +
    "Font Sans: %c" + fontSans + "%c\n" +
    "Background: %c" + background + "%c\n" +
    "Primary: %c" + primary + "%c\n" +
    "Border Radius: %c" + radius + "%c\n\n" +
    "Loaded Fonts: %c" + loadedFonts.join(', ') + "%c",
    "font-size: 16px; font-weight: bold; color: #3b82f6;", "", 
    "color: #10b981; font-weight: bold", "",
    themeType === "dark" ? "color: #6366f1; font-weight: bold" : "color: #eab308; font-weight: bold", "",
    "color: #f97316;", "",
    "color: #f97316;", "",
    "color: #f97316;", "",
    "color: #f97316;", "",
    "color: #8b5cf6;", ""
  );
}

export const Providers: React.FC<{
  children: React.ReactNode;
  session?: Session | null;
}> = ({ children, session }) => {
  const [themeType, setThemeType] = useState<"light" | "dark">("light");
  const [themeId, setThemeIdState] = useState<string>(defaultThemeId);
  const [mounted, setMounted] = useState(false);
  const [availableThemes, setAvailableThemes] = useState<string[]>([]);
  
  // Updated getTheme function - now async and uses database
  const getTheme = async (id?: string): Promise<Theme | null> => {
    const targetId = id || themeId;
    try {
      const theme = await getThemeById(targetId);
      if (!theme) {
        console.warn(`⚠️ Theme ${targetId} not found, falling back to default`);
        return await getThemeById(defaultThemeId);
      }
      return theme;
    } catch (error) {
      console.error(`❌ Error getting theme ${targetId}:`, error);
      return await getThemeById(defaultThemeId);
    }
  };
  
  // Enhanced setThemeId function with smooth transitions
  const setThemeId = async (id: string, element?: HTMLElement) => {
    const themeChangeCallback = async () => {
      try {
        const theme = await getThemeById(id);
        if (theme) {
          setThemeIdState(id);
          localStorage.setItem("themeId", id);
          setCookie("themeId", id, { path: "/", maxAge: 31536000 });
          console.log(`🎨 Theme changed to: ${theme.name} (${id})`);
        } else {
          console.warn(`⚠️ Theme ${id} not found in database`);
        }
      } catch (error) {
        console.error(`❌ Error setting theme ${id}:`, error);
      }
    };

    // Use smooth transition if element provided, otherwise regular transition
    if (element) {
      await smoothThemeToggle(element, themeChangeCallback);
    } else {
      await transitionTheme(themeChangeCallback);
    }
  };

  // Load available themes from database
  useEffect(() => {
    const loadAvailableThemes = async () => {
      try {
        const themeIds = await getAvailableThemeIds();
        setAvailableThemes(themeIds);
        console.log(`📚 Loaded ${themeIds.length} available themes:`, themeIds);
      } catch (error) {
        console.error("❌ Error loading available themes:", error);
        setAvailableThemes([defaultThemeId]); // Fallback
      }
    };
    
    loadAvailableThemes();
  }, []);

  // Initialize theme from storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      setMounted(true);
      
      const initializeTheme = async () => {
        // Load saved theme ID
        const savedThemeId = localStorage.getItem("themeId") || getCookie("themeId");
        if (savedThemeId) {
          const theme = await getThemeById(savedThemeId);
          if (theme) {
            setThemeIdState(savedThemeId);
          } else {
            console.warn(`⚠️ Saved theme ${savedThemeId} not found, using default`);
            setThemeIdState(defaultThemeId);
          }
        }
        
        // Load saved theme type
        const savedThemeType = localStorage.getItem("theme") || getCookie("theme");
        if (!savedThemeType) {
          const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
          setThemeType(systemPrefersDark ? "dark" : "light");
        } else {
          setThemeType(savedThemeType as "light" | "dark");
        }
      };
      
      initializeTheme();
    }
  }, []);

  // Apply theme when it changes
  useEffect(() => {
    if (!mounted || availableThemes.length === 0) return;
    
    const applyTheme = async () => {
      try {
        const theme = await getTheme();
        if (!theme) {
          console.error("❌ No theme available to apply");
          return;
        }
        
        console.log(`🎨 Applying theme: ${theme.name} (${themeType} mode)`);
        
        const variables = themeType === "dark" ? theme.dark : theme.light;
        const html = document.documentElement;
        
        // Remove old classes
        html.classList.remove("light", "dark");
        availableThemes.forEach(id => html.classList.remove(`theme-${id}`));
        
        // Add new classes
        html.classList.add(themeType);
        html.classList.add(`theme-${themeId}`);
        
        console.log(`🔧 Applying ${Object.keys(variables).length} CSS variables`);
        
        // Apply CSS variables
        for (const [key, value] of Object.entries(variables)) {
          html.style.setProperty(key, value);
        }
        
        // Load fonts
        try {
          console.log(`🔤 Auto-loading fonts from CSS variables...`);
          await dynamicFontManager.autoLoadFontsFromCSS();
        } catch (error) {
          console.error('❌ Failed to auto-load fonts:', error);
        }
        
        // Apply typography
        if (theme.typography?.trackingNormal) {
          document.body.style.letterSpacing = theme.typography.trackingNormal;
        }
        
        // Save theme type
        localStorage.setItem("theme", themeType);
        setCookie("theme", themeType, { path: "/", maxAge: 31536000 });
        
        // Update meta theme-color for iOS
        const isHome = window.location.pathname === "/";
        let themeColor = themeType === "dark" 
          ? (isHome ? getComputedStyle(html).getPropertyValue("--sidebar").trim() : getComputedStyle(html).getPropertyValue("--background").trim())
          : getComputedStyle(html).getPropertyValue("--background").trim();
          
        if (themeColor.startsWith("var(--")) {
          themeColor = getComputedStyle(html).getPropertyValue(themeColor.slice(4, -1)).trim();
        }
        
        // Convert HSL to hex for iOS compatibility
        if (themeColor && !themeColor.startsWith("#")) {
          const tempDiv = document.createElement('div');
          tempDiv.style.color = themeColor.includes("hsl") ? themeColor : `hsl(${themeColor})`;
          document.body.appendChild(tempDiv);
          const computedColor = getComputedStyle(tempDiv).color;
          document.body.removeChild(tempDiv);
          
          const rgbMatch = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
          if (rgbMatch) {
            const r = parseInt(rgbMatch[1]);
            const g = parseInt(rgbMatch[2]);
            const b = parseInt(rgbMatch[3]);
            themeColor = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
          }
        }
        
        // Update theme-color meta tag
        let metaTag = document.querySelector("meta[name='theme-color']") as HTMLMetaElement;
        if (!metaTag) {
          metaTag = document.createElement("meta");
          metaTag.setAttribute("name", "theme-color");
          document.head.appendChild(metaTag);
        }
        metaTag.setAttribute("content", themeColor);
        
        console.log(`✅ Theme applied: ${theme.name} (${themeType}) - iOS color: ${themeColor}`);
        
        // Log theme info
        logThemeInfo(themeId, themeType);
        
      } catch (error) {
        console.error("❌ Error applying theme:", error);
      }
    };

    applyTheme();
  }, [themeType, themeId, mounted, availableThemes]);

  // Enhanced toggleTheme with smooth transitions
  const toggleTheme = async (element?: HTMLElement) => {
    const themeChangeCallback = () => {
      setThemeType((prev) => (prev === "light" ? "dark" : "light"));
    };

    // Use smooth transition if element provided, otherwise regular transition
    if (element) {
      await smoothThemeToggle(element, themeChangeCallback);
    } else {
      await transitionTheme(themeChangeCallback);
    }
  };

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return (
    <SessionContextProvider supabaseClient={supabase} initialSession={session}>
      <InternalAuthProvider>
        <ThemeContext.Provider value={{ 
          themeType, 
          toggleTheme,
          themeId,
          setThemeId,
          getTheme,
          availableThemes
        }}>
          <LayoutManager>
            {children}
          </LayoutManager>
        </ThemeContext.Provider>
      </InternalAuthProvider>
    </SessionContextProvider>
  );
};

// Helper functions moved from layout
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