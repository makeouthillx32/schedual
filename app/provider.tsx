"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { Session, User } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider, useSessionContext } from "@supabase/auth-helpers-react";
import { setCookie, getCookie } from "@/lib/cookieUtils";
import { usePathname, useRouter } from "next/navigation";
import { Theme } from "@/types/theme"; 
import { defaultThemeId, themeMap } from "@/themes";
import { dynamicFontManager } from "@/lib/dynamicFontManager";

interface EnhancedThemeContextType {
  themeType: "light" | "dark";
  toggleTheme: () => void;
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
  const getTheme = (): Theme => {
    return themeMap[themeId] || themeMap[defaultThemeId];
  };
  const setThemeId = async (id: string) => {
    if (themeMap[id]) {
      setThemeIdState(id);
      localStorage.setItem("themeId", id);
      setCookie("themeId", id, { path: "/", maxAge: 31536000 });
      console.log(`🎨 Theme changed to: ${id}`);
    }
  };
  const availableThemes = Object.keys(themeMap);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setMounted(true);
      const savedThemeId = localStorage.getItem("themeId") || getCookie("themeId");
      if (savedThemeId && themeMap[savedThemeId]) {
        setThemeIdState(savedThemeId);
      }
      const savedThemeType = localStorage.getItem("theme") || getCookie("theme");
      if (!savedThemeType) {
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setThemeType(systemPrefersDark ? "dark" : "light");
      } else {
        setThemeType(savedThemeType as "light" | "dark");
      }
    }
  }, []);
  useEffect(() => {
    if (!mounted) return;
    const applyTheme = async () => {
      const theme = getTheme();
      console.log(`🎨 Applying theme: ${theme.name} (${themeType} mode)`);
      const variables = themeType === "dark" ? theme.dark : theme.light;
      const html = document.documentElement;
      html.classList.remove("light", "dark");
      availableThemes.forEach(id => html.classList.remove(`theme-${id}`));
      html.classList.add(themeType);
      html.classList.add(`theme-${themeId}`);
      console.log(`🔧 Applying ${Object.keys(variables).length} CSS variables`);
      for (const [key, value] of Object.entries(variables)) {
        html.style.setProperty(key, value);
      }
      try {
        console.log(`🔤 Auto-loading fonts from CSS variables...`);
        await dynamicFontManager.autoLoadFontsFromCSS();
      } catch (error) {
        console.error('❌ Failed to auto-load fonts:', error);
      }
      if (theme.typography?.trackingNormal) {
        document.body.style.letterSpacing = theme.typography.trackingNormal;
      }
      localStorage.setItem("theme", themeType);
      setCookie("theme", themeType, { path: "/", maxAge: 31536000 });
      const isHome = window.location.pathname === "/";
      let themeColor = themeType === "dark" 
        ? (isHome ? getComputedStyle(html).getPropertyValue("--sidebar").trim() : getComputedStyle(html).getPropertyValue("--background").trim())
        : getComputedStyle(html).getPropertyValue("--background").trim();
      if (themeColor.startsWith("var(--")) {
        themeColor = getComputedStyle(html).getPropertyValue(themeColor.slice(4, -1)).trim();
      }
      let metaTag = document.querySelector("meta[name='theme-color']");
      if (!metaTag) {
        metaTag = document.createElement("meta");
        metaTag.setAttribute("name", "theme-color");
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute("content", themeColor);
      console.log(`✅ Theme applied: ${theme.name} (${themeType})`);
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