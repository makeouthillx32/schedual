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
  const [themeType, setThemeType] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Ensure this runs only on the client
    if (typeof window !== "undefined") {
      const savedTheme = getCookie("theme") || "light"; // Fallback to "light"
      document.documentElement.setAttribute("data-theme", savedTheme);
      setThemeType(savedTheme as "light" | "dark");
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.setAttribute("data-theme", themeType);
      setCookie("theme", themeType, { path: "/", maxAge: 31536000 });
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
