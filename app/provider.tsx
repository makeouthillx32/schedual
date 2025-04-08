"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { Session } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { setCookie, getCookie } from "@/lib/cookieUtils";

interface ThemeContextType {
  themeType: "light" | "dark";
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const Providers: React.FC<{
  children: React.ReactNode;
  session?: Session | null;
}> = ({ children, session }) => {
  const [themeType, setThemeType] = useState<"light" | "dark">("light");

  // Theme logic
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

  // Supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  

  return (
    <SessionContextProvider supabaseClient={supabase} initialSession={session}>
      <ThemeContext.Provider value={{ themeType, toggleTheme }}>
        {children}
      </ThemeContext.Provider>
    </SessionContextProvider>
  );
};
