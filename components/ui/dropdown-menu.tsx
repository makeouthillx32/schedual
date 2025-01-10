"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuContent = DropdownMenuPrimitive.Content;

const CustomDropdown: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = React.useState<boolean>(false);

  // Detect theme (light or dark mode)
  React.useEffect(() => {
    const checkTheme = () => {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDarkMode(isDark);
    };

    checkTheme(); // Initial check
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", checkTheme);

    return () => {
      window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change", checkTheme);
    };
  }, []);

  // Define dynamic color for the hamburger icon based on the theme
  const iconColor = isDarkMode ? "#FFFFFF" : "#000000";

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
              style={{
                backgroundColor: iconColor,
                width: "24px",
                height: "3px",
                borderRadius: "2px",
                transition: "background-color 0.3s ease",
              }}
            ></div>
            <div
              style={{
                backgroundColor: iconColor,
                width: "24px",
                height: "3px",
                borderRadius: "2px",
                transition: "background-color 0.3s ease",
              }}
            ></div>
            <div
              style={{
                backgroundColor: iconColor,
                width: "24px",
                height: "3px",
                borderRadius: "2px",
                transition: "background-color 0.3s ease",
              }}
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