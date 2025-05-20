"use client";

import React from "react";
import { useTheme } from "@/app/provider";
import SwitchtoDarkMode from "./SwitchtoDarkMode";
import { CustomDropdown } from "@/components/Layouts/appheader/dropdown-menu";

interface NavProps {
  pageTitle?: string;
}

const Nav: React.FC<NavProps> = ({ pageTitle }) => {
  const { themeType } = useTheme();
  const isDark = themeType === "dark";

  return (
    <nav
      className={`flex justify-between items-center p-4 transition-colors ${
        isDark 
          ? "bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))]" 
          : "bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))]"
      } shadow-[var(--shadow-sm)]`}
    >
      <h1 className="text-lg font-bold font-[var(--font-sans)]">
        CMS Schedule App
        {pageTitle && <span className="ml-2 text-lg font-normal">{pageTitle}</span>}
      </h1>
      <div className="flex items-center gap-4">
        {/* Theme toggle */}
        <SwitchtoDarkMode />
        {/* Dropdown menu */}
        <div className="relative z-10">
          <CustomDropdown />
        </div>
      </div>
    </nav>
  );
};

export default Nav;