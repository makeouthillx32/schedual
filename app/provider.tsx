"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { setCookie, getCookie } from "@/lib/cookieUtils";

const ThemeContext = createContext<any | null>(null);

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeType, setThemeType] = useState<"light" | "dark">(() => {
    // Retrieve the saved theme synchronously from cookies
    if (typeof window !== "undefined") {
      return (getCookie("theme") as "light" | "dark") || "light";
    }
    return "light"; // Fallback during SSR
  });

  const toggleTheme = () => {
    const newTheme = themeType === "light" ? "dark" : "light";
    setThemeType(newTheme);
    setCookie("theme", newTheme); // Save the new theme to cookies
  };

  useEffect(() => {
    // Apply the theme to the document early
    document.documentElement.setAttribute("data-theme", themeType);
  }, [themeType]);

  useEffect(() => {
    // Ensure the saved theme from cookies is applied on mount
    const savedTheme = getCookie("theme") as "light" | "dark";
    if (savedTheme && savedTheme !== themeType) {
      setThemeType(savedTheme); // Sync state with cookie value
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ themeType, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};