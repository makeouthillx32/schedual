"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { Session, User } from "@supabase/auth-helpers-nextjs";
import {
  SessionContextProvider,
  useSessionContext,
} from "@supabase/auth-helpers-react";
import { setCookie, getCookie } from "@/lib/cookieUtils";

interface ThemeContextType {
  themeType: "light" | "dark";
  toggleTheme: () => void;
}
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Expose the theme hook
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// ------------------- Auth Context ------------------- //

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Expose the auth hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// The actual AuthProvider that wraps SessionContextProvider
function InternalAuthProvider({ children }: { children: React.ReactNode }) {
  const { supabaseClient, session } = useSessionContext();
  const user = session?.user || null;

  // 1) signIn
  async function signIn(email: string, password: string) {
    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error("Sign-in error:", error.message);
    }
  }

  // 2) signOut
  async function signOut() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      console.error("Sign-out error:", error.message);
    }
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// --------------------------------------------------- //

export const Providers: React.FC<{
  children: React.ReactNode;
  session?: Session | null;
}> = ({ children, session }) => {
  // -- THEME LOGIC --
  const [themeType, setThemeType] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = getCookie("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    setThemeType(savedTheme as "light" | "dark");
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themeType);
    setCookie("theme", themeType, { path: "/", maxAge: 31536000 });
  }, [themeType]);

  const toggleTheme = () => {
    setThemeType((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Create the supabase browser client for the SessionContextProvider
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
