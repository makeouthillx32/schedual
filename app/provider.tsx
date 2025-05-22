"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { Session, User } from "@supabase/auth-helpers-nextjs";
import {
  SessionContextProvider,
  useSessionContext,
} from "@supabase/auth-helpers-react";
import { setCookie, getCookie } from "@/lib/cookieUtils";
import { usePathname, useRouter } from "next/navigation";
import { Theme } from "@/types/theme"; 
import { defaultThemeId, themeMap } from "@/themes";

// Enhanced theme context with theme ID and other properties
interface EnhancedThemeContextType {
  themeType: "light" | "dark";
  toggleTheme: () => void;
  
  // New theme properties
  themeId: string;
  setThemeId: (id: string) => void;
  getTheme: () => Theme;
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

// Theme inspector function for console logging
function logThemeInfo(themeId: string, themeType: "light" | "dark") {
  if (typeof window === "undefined") return;
  
  const root = document.documentElement;
  const getVar = (name: string) => getComputedStyle(root).getPropertyValue(name).trim();
  
  // Get key CSS variables
  const fontSans = getVar('--font-sans');
  const background = getVar('--background');
  const primary = getVar('--primary');
  const radius = getVar('--radius');
  
  // Format a nice console output with styling
  console.log(
    "%cTheme Inspector%c\n\n" + 
    "Theme ID: %c" + themeId + "%c\n" +
    "Theme Mode: %c" + themeType + "%c\n\n" +
    "Font Sans: %c" + fontSans + "%c\n" +
    "Background: %c" + background + "%c\n" +
    "Primary: %c" + primary + "%c\n" +
    "Border Radius: %c" + radius + "%c\n",
    "font-size: 16px; font-weight: bold; color: #3b82f6;", "", 
    "color: #10b981; font-weight: bold", "",
    themeType === "dark" ? "color: #6366f1; font-weight: bold" : "color: #eab308; font-weight: bold", "",
    "color: #f97316;", "",
    "color: #f97316;", "",
    "color: #f97316;", "",
    "color: #f97316;", ""
  );
  
  // Display color swatches for key colors
  console.log("%cCurrent Theme Colors", "font-size: 14px; font-weight: bold;");
  
  const colorVars = [
    'background', 'foreground', 'card', 'card-foreground',
    'primary', 'primary-foreground', 'secondary', 'secondary-foreground',
    'muted', 'muted-foreground', 'accent', 'accent-foreground'
  ];
  
  colorVars.forEach(name => {
    const value = getVar(`--${name}`);
    console.log(
      `%c    %c --${name}: ${value}`,
      `background: hsl(${value}); padding: 10px; margin-right: 5px; border: 1px solid #ccc;`,
      "font-family: monospace;"
    );
  });
}

export const Providers: React.FC<{
  children: React.ReactNode;
  session?: Session | null;
}> = ({ children, session }) => {
  // Theme state (light/dark)
  const [themeType, setThemeType] = useState<"light" | "dark">("light");
  
  // Theme ID state (which theme preset to use)
  const [themeId, setThemeIdState] = useState<string>(defaultThemeId);
  
  const [mounted, setMounted] = useState(false);

  // Get current theme object
  const getTheme = (): Theme => {
    return themeMap[themeId] || themeMap[defaultThemeId];
  };

  // Set theme ID and save to cookies
  const setThemeId = (id: string) => {
    if (themeMap[id]) {
      setThemeIdState(id);
      localStorage.setItem("themeId", id);
      setCookie("themeId", id, { path: "/", maxAge: 31536000 });
      
      // Log theme change to console
      if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
        console.log(`Theme changed to: ${id}`);
      }
    }
  };

  // Get list of available theme IDs
  const availableThemes = Object.keys(themeMap);

  // Initialize theme from cookie or system preference
  useEffect(() => {
    // Only run on client
    if (typeof window !== "undefined") {
      setMounted(true);
      
      // Get theme preset ID
      const savedThemeId = localStorage.getItem("themeId") || getCookie("themeId");
      if (savedThemeId && themeMap[savedThemeId]) {
        setThemeIdState(savedThemeId);
      }
      
      // Get color mode (light/dark)
      const savedThemeType = localStorage.getItem("theme") || getCookie("theme");
      
      // If no saved preference, check system preference
      if (!savedThemeType) {
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setThemeType(systemPrefersDark ? "dark" : "light");
      } else {
        setThemeType(savedThemeType as "light" | "dark");
      }
    }
  }, []);

  // Apply theme changes
  useEffect(() => {
    if (!mounted) return;
    
    // Get the current theme
    const theme = getTheme();
    
    // Get the CSS variables for the current theme and mode
    const variables = themeType === "dark" ? theme.dark : theme.light;
    
    // Apply to HTML element
    const html = document.documentElement;
    
    // Apply theme CSS variables
    for (const [key, value] of Object.entries(variables)) {
      html.style.setProperty(key, value);
    }
    
    // Apply tailwind dark class
    html.classList.remove("light", "dark");
    html.classList.add(themeType);
    
    // Apply letter-spacing if it exists
    if (theme.typography?.trackingNormal) {
      document.body.style.letterSpacing = theme.typography.trackingNormal;
    }
    
    // Save in both localStorage and cookie for persistence
    localStorage.setItem("theme", themeType);
    setCookie("theme", themeType, { path: "/", maxAge: 31536000 });

    // Get appropriate color for theme-color meta tag
    const isHome = window.location.pathname === "/";
    let themeColor;
    
    if (themeType === "dark") {
      themeColor = isHome 
        ? getComputedStyle(html).getPropertyValue("--sidebar").trim() 
        : getComputedStyle(html).getPropertyValue("--background").trim();
    } else {
      themeColor = isHome 
        ? getComputedStyle(html).getPropertyValue("--background").trim() 
        : getComputedStyle(html).getPropertyValue("--background").trim();
    }
    
    // Convert HSL variable format to actual color if needed
    if (themeColor.startsWith("var(--")) {
      themeColor = getComputedStyle(html).getPropertyValue(themeColor.slice(4, -1)).trim();
    }
    
    // Set meta tag
    let metaTag = document.querySelector("meta[name='theme-color']");
    if (!metaTag) {
      metaTag = document.createElement("meta");
      metaTag.setAttribute("name", "theme-color");
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute("content", themeColor);
    
    // Log theme details to console (only in development)
    if (process.env.NODE_ENV === "development") {
      logThemeInfo(themeId, themeType);
    }
  }, [themeType, themeId, mounted]);

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