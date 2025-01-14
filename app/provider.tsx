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
    const savedTheme = getCookie("theme"); // Load saved theme from cookies
    return savedTheme === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    // Apply theme to the HTML element
    document.documentElement.setAttribute("data-theme", themeType);

    // Update the cookie with the current theme
    setCookie("theme", themeType, { path: "/", maxAge: 31536000 }); // 1-year expiration
  }, [themeType]);

  const toggleTheme = () => {
    setThemeType((prev) => {
      const newTheme = prev === "light" ? "dark" : "light";
      setCookie("theme", newTheme, { path: "/", maxAge: 31536000 }); // Ensure cookie is updated
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ themeType, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};