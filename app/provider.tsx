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
    // Safely initialize the state with the cookie value or fallback to "light"
    const savedTheme = getCookie("theme");
    return savedTheme === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    if (typeof document !== "undefined" && themeType) {
      // Ensure `themeType` is defined before setting the attribute
      document.documentElement.setAttribute("data-theme", themeType);
      setCookie("theme", themeType, { path: "/", maxAge: 31536000 }); // Save theme in cookie
    }
  }, [themeType]);

  const toggleTheme = () => {
    setThemeType((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ themeType, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
