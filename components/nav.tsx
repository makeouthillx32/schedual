"use client";

import React from "react";
import SwitchtoDarkMode from "./SwitchtoDarkMode";
import { CustomDropdown } from "./ui/dropdown-menu";
import { useTheme } from "@/app/providers"; // Correct absolute path to `providers.tsx`

const Nav: React.FC = () => {
  const { themeType, toggleTheme } = useTheme(); // Access theme state and toggle function

  return (
    <nav
      className={`flex justify-between items-center p-4 ${
        themeType === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}
    >
      <h1>CMS Schedule App</h1>
      <div className="flex items-center">
        {/* SwitchtoDarkMode on the left */}
        <SwitchtoDarkMode themeType={themeType} toggleTheme={toggleTheme} />
        {/* Dropdown menu */}
        <CustomDropdown />
      </div>
    </nav>
  );
};

export default Nav;