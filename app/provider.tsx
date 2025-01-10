"use client";

import React, { createContext, useContext, useState } from "react";

interface ThemeContextType {
  themeType: "dark" | "light";
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeType, setThemeType] = useState<"dark" | "light">("light");

  const toggleTheme = () => {
    setThemeType((prev) => (prev === "light" ? "dark" : "light"));
    // Sync with Tailwind's `dark` class
    if (typeof window !== "undefined") {
      document.documentElement.classList.toggle("dark", themeType === "light");
    }
  };

  return (
    <ThemeContext.Provider value={{ themeType, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within Providers");
  }
  return context;
};