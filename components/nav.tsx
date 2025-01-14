"use client";

import React from "react";
import { useTheme } from "@/app/provider";
import SwitchtoDarkMode from "./SwitchtoDarkMode";
import { CustomDropdown } from "@/components/ui/dropdown-menu";

const Nav: React.FC = () => {
  const { toggleTheme } = useTheme(); // No need for themeType here

  return (
    <nav className="flex justify-between items-center p-4 bg-background text-foreground transition-colors">
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