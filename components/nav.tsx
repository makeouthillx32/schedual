"use client";

import React from "react";
import { useTheme } from "@/app/provider";
import SwitchtoDarkMode from "./SwitchtoDarkMode";
import { CustomDropdown } from "@/components/ui/dropdown-menu"; // Correct path

const Nav: React.FC = () => {
  const { themeType } = useTheme(); // Access themeType only for dynamic styles

  return (
    <nav
      className="flex justify-between items-center p-4"
      style={{
        backgroundColor: "var(--background)", // Dynamic background
        color: "var(--foreground)", // Dynamic foreground
      }}
    >
      <h1 className="text-lg font-bold">CMS Schedule App</h1>
      <div className="flex items-center gap-4">
        {/* SwitchtoDarkMode handles its own theme logic */}
        <SwitchtoDarkMode />
        <div className="relative z-10">
          {/* Dropdown menu */}
          <CustomDropdown />
        </div>
      </div>
    </nav>
  );
};

export default Nav;