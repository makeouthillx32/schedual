"use client";

import React, { useEffect } from "react";
import { useTheme } from "@/app/provider";
import { getCookie, setCookie } from "@/lib/cookieUtils"; // Ensure this utility works

const Nav: React.FC = () => {
  const { themeType, toggleTheme } = useTheme(); // Access theme context

  // Sync cookies with the current theme
  useEffect(() => {
    const savedTheme = getCookie("theme");
    if (savedTheme && savedTheme !== themeType) {
      toggleTheme(); // Sync theme on initial load
    }
  }, []); // Run only on the first render

  useEffect(() => {
    setCookie("theme", themeType, { path: "/", maxAge: 31536000 }); // Save theme to cookies
  }, [themeType]);

  return (
    <nav
      className="flex justify-between items-center p-4"
      style={{
        backgroundColor: "var(--background)", // Dynamically styled by global CSS
        color: "var(--foreground)", // Dynamically styled by global CSS
      }}
    >
      <h1 className="text-lg font-bold">CMS Schedule App</h1>
      <div className="relative z-10">
        {/* Dropdown menu placeholder */}
        <button>Menu</button>
      </div>
    </nav>
  );
};

export default Nav;