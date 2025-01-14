"use client";

import React from "react";
import SwitchtoDarkMode from "./SwitchtoDarkMode";
import { CustomDropdown } from "./ui/dropdown-menu";
import { useTheme } from "@/app/provider";

const Nav: React.FC = () => {
  const { themeType } = useTheme(); // Only get themeType for styling purposes

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
        <SwitchtoDarkMode /> {/* No need to pass props, uses useTheme internally */}
        <div className="relative z-10">
          <CustomDropdown />
        </div>
      </div>
    </nav>
  );
};

export default Nav;