"use client";

import { GeistProvider, CssBaseline } from "@geist-ui/core";
import React, { useState, createContext, useContext } from "react";
import Nav from "@/components/nav";
import "./globals.css";

// Theme context
interface ThemeContextType {
  themeType: "dark" | "light";
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

// ThemeProvider
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [themeType, setThemeType] = useState<"dark" | "light">("light");

  const toggleTheme = (): void => {
    setThemeType((last) => (last === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ themeType, toggleTheme }}>
      <GeistProvider themeType={themeType}>
        <CssBaseline />
        {children}
      </GeistProvider>
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// Layout Component
interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <Nav />
          <main style={{ padding: "20px" }}>{children}</main>
          <footer
            style={{
              padding: "10px",
              background: "var(--background)", // Utilize theme colors
              color: "var(--foreground)", // Utilize theme colors
              textAlign: "center",
            }}
          >
            <p>&copy; {new Date().getFullYear()} Powered by unenter</p>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default Layout;