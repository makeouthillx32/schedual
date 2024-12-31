"use client";

import React, { useState } from "react";
import SwitchtoDarkMode from "./SwitchtoDarkMode";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCurrentDateTime,
} from "./ui/dropdown-menu";

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-2 bg-gray-200 dark:bg-gray-800 rounded-md"
              aria-label="Toggle menu"
            >
              <span className="hamburger"></span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {/* Current date and time displayed in the dropdown */}
            <DropdownMenuCurrentDateTime />
            <DropdownMenuItem>
              <a href="#">Home</a>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <a href="#">Schedule</a>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <a href="#">Settings</a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <SwitchtoDarkMode themeType={themeType} toggleTheme={toggleTheme} />
      </div>
    </nav>
  );
};

export default Nav;
