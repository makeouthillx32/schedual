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

  // Sync `data-theme` attribute whenever `themeType` changes
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", themeType);
    }
  }, [themeType]);

  // Immediately update both theme state and cookie
  const toggleTheme = () => {
    const newTheme = themeType === "light" ? "dark" : "light";
    setThemeType(newTheme); // Update the state
    setCookie("theme", newTheme, { path: "/", maxAge: 31536000 }); // Update the cookie immediately
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", newTheme); // Sync immediately
    }
  };

  return (
    <ThemeContext.Provider value={{ themeType, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};