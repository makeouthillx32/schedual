"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
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

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeType, setThemeType] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const savedTheme = getCookie("theme");
      return savedTheme === "dark" ? "dark" : "light";
    }
    return "light"; // Default during SSR
  });

  // Sync theme with `data-theme` and cookies
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", themeType);
      setCookie("theme", themeType, { path: "/", maxAge: 31536000 }); // Save cookie for 1 year
    }
  }, [themeType]);

  // Toggle theme and immediately sync state, cookies, and `data-theme`
  const toggleTheme = () => {
    const newTheme = themeType === "light" ? "dark" : "light";
    setThemeType(newTheme); // Update state
    document.documentElement.setAttribute("data-theme", newTheme); // Update `data-theme`
    setCookie("theme", newTheme, { path: "/", maxAge: 31536000 }); // Update cookie
  };

  return (
    <ThemeContext.Provider value={{ themeType, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};