"use client";

import { GeistProvider, CssBaseline } from "@geist-ui/core";
import React, { useState, useEffect } from "react";
import Nav from "@/components/nav";
import "./globals.css";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [themeType, setThemeType] = useState<"dark" | "light">("light");
  const [day, setDay] = useState<string>("monday"); // Default day
  const [week, setWeek] = useState<number>(1); // Default week

  const toggleTheme = (): void => {
    setThemeType((last) => (last === "light" ? "dark" : "light"));
  };

  const handleDayChange = (newDay: string, newWeek: number) => {
    setDay(newDay);
    setWeek(newWeek);
  };

  return (
    <html lang="en">
      <body>
        <GeistProvider themeType={themeType}>
          <CssBaseline />
          <Nav
            themeType={themeType}
            toggleTheme={toggleTheme}
            day={day}
            week={week}
            onDayChange={handleDayChange}
          />
          <main style={{ padding: "20px" }}>{children}</main>
          <footer
            style={{
              padding: "10px",
              background: themeType === "dark" ? "#1e1e1e" : "#f5f5f5",
              color: themeType === "dark" ? "#fff" : "#000",
              textAlign: "center",
            }}
          >
            <p>&copy; {new Date().getFullYear()} Powered by unenter</p>
          </footer>
        </GeistProvider>
      </body>
    </html>
  );
};

export default Layout;
