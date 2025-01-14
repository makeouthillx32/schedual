"use client";

import React from "react";
import { useTheme } from "@/app/provider";
import SwitchtoDarkMode from "./SwitchtoDarkMode";
import { CustomDropdown } from "@/components/ui/dropdown-menu"; // Correct path

const Nav: React.FC = () => {
  const { themeType, toggleTheme } = useTheme(); // Access themeType and toggleTheme

  return (
    <nav className="flex justify-between items-center p-4 bg-background text-foreground">
      <h1 className="text-lg font-bold">CMS Schedule App</h1>
      <div className="flex items-center gap-4">
        {/* Pass props to SwitchtoDarkMode */}
        <SwitchtoDarkMode themeType={themeType} toggleTheme={toggleTheme} />
        <div className="relative z-10">
          <CustomDropdown />
        </div>
      </div>
    </nav>
  );
};

export default Nav;