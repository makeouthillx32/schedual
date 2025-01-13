"use client";

import { Providers } from "./provider"; // Ensure correct path
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import "./globals.css";
import { useEffect } from "react";
import { useTheme } from "./provider";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { themeType } = useTheme(); // Access theme type from provider

  useEffect(() => {
    // Dynamically update the theme-color meta tag
    const metaThemeColor = document.querySelector("meta[name='theme-color']");
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", themeType === "dark" ? "#111827" : "#ffffff");
    }
  }, [themeType]);

  return (
    <html lang="en" data-theme={themeType}>
      <head>
        {/* Initial meta tag */}
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body>
        <Providers>
          <Nav />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
};

export default Layout;