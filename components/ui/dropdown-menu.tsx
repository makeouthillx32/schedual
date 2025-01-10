"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { useTheme } from "next-themes"; // Using a theme provider

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuContent = DropdownMenuPrimitive.Content;

const CustomDropdown: React.FC = () => {
  const { theme } = useTheme(); // Accessing the current theme (light or dark)

  // Define dynamic color for the hamburger icon based on the theme
  const iconColor = theme === "dark" ? "bg-white" : "bg-black";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center justify-center w-8 h-8"
          aria-label="Toggle menu"
        >
          {/* Hamburger menu */}
          <div className="space-y-1.5">
            <div
              className={`w-6 h-0.5 rounded ${iconColor} transition-colors`}
            ></div>
            <div
              className={`w-6 h-0.5 rounded ${iconColor} transition-colors`}
            ></div>
            <div
              className={`w-6 h-0.5 rounded ${iconColor} transition-colors`}
            ></div>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="z-50 min-w-[8rem] rounded-md border bg-white dark:bg-gray-800 p-1 shadow-md"
        sideOffset={8}
      >
        <div className="flex flex-col space-y-1">
          <DropdownMenuPrimitive.Item className="p-2 text-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700">
            Home
          </DropdownMenuPrimitive.Item>
          <DropdownMenuPrimitive.Item className="p-2 text-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700">
            Schedule
          </DropdownMenuPrimitive.Item>
          <DropdownMenuPrimitive.Item className="p-2 text-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700">
            Settings
          </DropdownMenuPrimitive.Item>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { CustomDropdown };