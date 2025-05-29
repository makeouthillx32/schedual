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

interface EnhancedThemeContextType {
  themeType: "light" | "dark";
  toggleTheme: () => void;
  themeId: string;
  setThemeId: (id: string) => void;
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
  
  // Updated setThemeId function - now checks database
  const setThemeId = async (id: string) => {
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
        
        // Update meta theme-color
        const isHome = window.location.pathname === "/";
        let themeColor = themeType === "dark" 
          ? (isHome ? getComputedStyle(html).getPropertyValue("--sidebar").trim() : getComputedStyle(html).getPropertyValue("--background").trim())
          : getComputedStyle(html).getPropertyValue("--background").trim();
          
        if (themeColor.startsWith("var(--")) {
          themeColor = getComputedStyle(html).getPropertyValue(themeColor.slice(4, -1)).trim();
        }
        
        let metaTag = document.querySelector("meta[name='theme-color']") as HTMLMetaElement;
        if (!metaTag) {
          metaTag = document.createElement("meta");
          metaTag.setAttribute("name", "theme-color");
          document.head.appendChild(metaTag);
        }
        metaTag.setAttribute("content", themeColor);
        
        console.log(`✅ Theme applied: ${theme.name} (${themeType})`);
        
        // Log theme info
        logThemeInfo(themeId, themeType);
        
      } catch (error) {
        console.error("❌ Error applying theme:", error);
      }
    };

    applyTheme();
  }, [themeType, themeId, mounted, availableThemes]);

  const toggleTheme = () => {
    setThemeType((prev) => (prev === "light" ? "dark" : "light"));
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
          {children}
        </ThemeContext.Provider>
      </InternalAuthProvider>
    </SessionContextProvider>
  );
};