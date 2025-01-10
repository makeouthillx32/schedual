"use client";

import React from "react";
import SwitchtoDarkMode from "./SwitchtoDarkMode";
import { CustomDropdown } from "./ui/dropdown-menu";
import { useTheme } from "@/app/provider";

const Nav: React.FC = () => {
  const { themeType, toggleTheme } = useTheme();

  return (
    <nav
      className={`flex justify-between items-center p-4 ${
        themeType === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}
    >
      <h1>CMS Schedule App</h1>
      <div className="flex items-center">
        <SwitchtoDarkMode themeType={themeType} toggleTheme={toggleTheme} />
        <CustomDropdown />
      </div>
    </nav>
  );
};

export default Nav;