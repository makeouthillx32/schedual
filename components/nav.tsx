"use client";

import React from "react";
import SwitchtoDarkMode from "./SwitchtoDarkMode";
import { CustomDropdown } from "./ui/dropdown-menu";
import { useTheme } from "@/app/provider";

const Nav: React.FC = () => {
  const { themeType, toggleTheme } = useTheme(); // Access theme context

  return (
    <nav
      className="flex justify-between items-center p-4"
      style={{
        backgroundColor: "var(--background)", // Dynamic background from global.css
        color: "var(--foreground)", // Dynamic foreground from global.css
      }}
    >
      <h1 className="text-lg font-bold">CMS Schedule App</h1>
      <div className="flex items-center gap-4">
        {/* Theme toggle button */}
        <SwitchtoDarkMode themeType={themeType} toggleTheme={toggleTheme} />
        <div className="relative z-10">
          {/* Dropdown menu */}
          <CustomDropdown />
        </div>
      </div>
    </nav>
  );
};

export default Nav;