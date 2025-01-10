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
      <h1 className="text-lg font-bold">CMS Schedule App</h1>
      <div className="flex items-center gap-4">
        <SwitchtoDarkMode themeType={themeType} toggleTheme={toggleTheme} />
        <div className="relative z-10">
          <CustomDropdown />
        </div>
      </div>
    </nav>
  );
};

export default Nav;