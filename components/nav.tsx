"use client";

import React from "react";
import { useTheme } from "@/app/provider";
import SwitchtoDarkMode from "./SwitchtoDarkMode";
import { CustomDropdown } from "@/components/ui/dropdown-menu";

const Nav: React.FC = () => {
  const { themeType, toggleTheme } = useTheme(); // Access theme context

  return (
    <nav
      className={`flex justify-between items-center p-4 transition-colors ${
        themeType === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}
    >
      <h1 className="text-lg font-bold">CMS Schedule App</h1>
      <div className="flex items-center gap-4">
        {/* Theme toggle */}
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