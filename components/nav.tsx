"use client";

import React from "react";
import { useTheme } from "@/app/provider";
import SwitchtoDarkMode from "./SwitchtoDarkMode";
import { CustomDropdown } from "@/components/ui/dropdown-menu";

const Nav: React.FC = () => {
  const { themeType, toggleTheme } = useTheme(); // Access theme context

  return (
    <nav
      className="flex justify-between items-center p-4"
      style={{
        backgroundColor: "var(--background)", // Theme-driven background
        color: "var(--foreground)", // Theme-driven text color
      }}
    >
      <h1 className="text-lg font-bold">CMS Schedule App</h1>
      <div className="flex items-center gap-4">
        {/* Pass toggleTheme to SwitchtoDarkMode */}
        <SwitchtoDarkMode toggleTheme={toggleTheme} />
        {/* Dropdown menu */}
        <div className="relative z-10">
          <CustomDropdown />
        </div>
      </div>
    </nav>
  );
};

export default Nav;