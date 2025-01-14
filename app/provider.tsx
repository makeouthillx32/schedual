"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { setCookie, getCookie } from "@/lib/cookieUtils"; // Ensure this points to the correct cookies utility path.

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
    const savedTheme = getCookie("theme"); // Load the saved theme from cookies.
    return savedTheme === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", themeType === "dark");
    setCookie("theme", themeType, { path: "/", maxAge: 31536000 }); // Save the theme in cookies for 1 year.
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