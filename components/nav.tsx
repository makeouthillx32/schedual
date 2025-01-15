"use client";

import React from "react";
import { useTheme } from "@/app/provider";
import SwitchtoDarkMode from "./SwitchtoDarkMode";
import { CustomDropdown } from "@/components/ui/dropdown-menu";
import { usePathname } from "next/navigation"; // Import for detecting the current route

const Nav: React.FC = () => {
  const { themeType, toggleTheme } = useTheme();
  const pathname = usePathname(); // Get the current path

  // Check if the current path is under /Tools
  const isToolsPage = pathname.startsWith("/Tools");

  return (
    <nav
      className={`flex justify-between items-center p-4 transition-colors ${
        themeType === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}
    >
      <h1 className="text-lg font-bold">
        CMS Schedule App
        {isToolsPage && <span className="ml-2 text-lg font-bold">tools</span>}
      </h1>
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