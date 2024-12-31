"use client";

import React from "react";
import SwitchtoDarkMode from "./SwitchtoDarkMode";
import { CustomDropdown } from "./ui/dropdown-menu";

interface NavProps {
  themeType: "dark" | "light";
  toggleTheme: () => void;
}

const Nav: React.FC<NavProps> = ({ themeType, toggleTheme }) => {
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
