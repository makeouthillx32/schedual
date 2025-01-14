"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface ThemeContextType {
  themeType: "light" | "dark";
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeType, setThemeType] = useState<"light" | "dark">("light");

  // Load theme from local storage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || savedTheme === "light") {
      setThemeType(savedTheme);
      document.documentElement.classList.add(savedTheme);
    }
  }, []);

  // Toggle theme and save to local storage
  const toggleTheme = () => {
    const newTheme = themeType === "light" ? "dark" : "light";
    setThemeType(newTheme);
    localStorage.setItem("theme", newTheme);

    // Update the document class
    document.documentElement.classList.remove(themeType);
    document.documentElement.classList.add(newTheme);
  };

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