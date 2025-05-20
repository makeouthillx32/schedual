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

interface ThemeContextType {
  themeType: "light" | "dark";
  toggleTheme: () => void;
}
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
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

export const Providers: React.FC<{
  children: React.ReactNode;
  session?: Session | null;
}> = ({ children, session }) => {
  const [themeType, setThemeType] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  // Initialize theme from cookie or system preference
  useEffect(() => {
    // Only run on client
    if (typeof window !== "undefined") {
      setMounted(true);
      
      // First check for saved preference
      const savedTheme = localStorage.getItem("theme") || getCookie("theme");
      
      // If no saved preference, check system preference
      if (!savedTheme) {
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setThemeType(systemPrefersDark ? "dark" : "light");
      } else {
        setThemeType(savedTheme as "light" | "dark");
      }
    }
  }, []);

  // Apply theme changes
  useEffect(() => {
    if (!mounted) return;
    
    // Apply to HTML element
    const html = document.documentElement;
    html.classList.remove("light", "dark");
    html.classList.add(themeType);
    
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
  }, [themeType, mounted]);

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
        <ThemeContext.Provider value={{ themeType, toggleTheme }}>
          {children}
        </ThemeContext.Provider>
      </InternalAuthProvider>
    </SessionContextProvider>
  );
};