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
  }, [isLoading, user, pathname]);

  async function signIn(email: string, password: string) {
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) console.error("Sign-in error:", error.message);
  }

  async function signOut() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) console.error("Sign-out error:", error.message);
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

  useEffect(() => {
    const savedTheme = getCookie("theme") || "light";
    setThemeType(savedTheme as "light" | "dark");
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove("light", "dark");
    html.classList.add(themeType);
    setCookie("theme", themeType, { path: "/", maxAge: 31536000 });

    const isHome = window.location.pathname === "/";
    const cssVar = isHome ? "--home-nav-bg" : "--hnf-background";
    const color = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();

    let metaTag = document.querySelector("meta[name='theme-color']");
    if (!metaTag) {
      metaTag = document.createElement("meta");
      metaTag.setAttribute("name", "theme-color");
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute("content", color);
  }, [themeType]);

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