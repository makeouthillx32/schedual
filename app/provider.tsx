"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { setCookie, getCookie } from "@/lib/cookieUtils";

const ThemeContext = createContext<any | null>(null);

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeType, setThemeType] = useState<"light" | "dark">(() => {
    // Load theme from cookies or default to "light"
    if (typeof window !== "undefined") {
      return (getCookie("theme") as "light" | "dark") || "light";
    }
    return "light"; // Fallback during SSR
  });

  const toggleTheme = () => {
    const newTheme = themeType === "light" ? "dark" : "light";
    setThemeType(newTheme);
    setCookie("theme", newTheme); // Save theme to cookies
  };

  useEffect(() => {
    // Apply the saved theme to the document
    document.documentElement.setAttribute("data-theme", themeType);
  }, [themeType]);

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