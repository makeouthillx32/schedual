"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext<any | null>(null);

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeType, setThemeType] = useState<"light" | "dark">("light");

  const toggleTheme = () => {
    setThemeType((prev) => (prev === "light" ? "dark" : "light"));
  };

  useEffect(() => {
    // Update the `theme-color` meta tag dynamically
    const metaThemeColor = document.querySelector("meta[name='theme-color']");
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", themeType === "dark" ? "#111827" : "#ffffff");
    }

    // Update the `data-theme` attribute for CSS
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
