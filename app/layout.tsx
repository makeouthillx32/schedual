"use client";

import { GeistProvider, CssBaseline, Themes } from "@geist-ui/core";
import React, { useState } from "react";
import "./globals.css";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [themeType, setThemeType] = useState<"dark" | "light">("light");

  const toggleTheme = (): void => {
    setThemeType((last) => (last === "light" ? "dark" : "light"));
  };

  return (
    <html lang="en">
      <GeistProvider themes={[Themes.light, Themes.dark]} themeType={themeType}>
        <CssBaseline />
        <body>
          <header
            style={{
              padding: "10px",
              background: themeType === "dark" ? "#1e1e1e" : "#f5f5f5",
              color: themeType === "dark" ? "#fff" : "#000",
              textAlign: "center",
            }}
          >
            <h1>Cleaning Schedule App</h1>
            <button
              onClick={toggleTheme}
              style={{
                padding: "10px 20px",
                margin: "10px",
                borderRadius: "5px",
                background: themeType === "dark" ? "#333" : "#ddd",
                color: themeType === "dark" ? "#fff" : "#000",
                border: "none",
                cursor: "pointer",
              }}
            >
              {themeType === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            </button>
          </header>
          <main style={{ padding: "20px" }}>{children}</main>
          <footer
            style={{
              padding: "10px",
              background: themeType === "dark" ? "#1e1e1e" : "#f5f5f5",
              color: themeType === "dark" ? "#fff" : "#000",
              textAlign: "center",
            }}
          >
            <p>&copy; {new Date().getFullYear()} Cleaning Schedule App</p>
          </footer>
        </body>
      </GeistProvider>
    </html>
  );
};

export default Layout;
