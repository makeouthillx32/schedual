"use client";

import React from "react";
import { CustomDropdown } from "./ui/dropdown-menu";
import { useTheme } from "@/app/provider"; // Use the existing Providers without changing anything

const Nav: React.FC = () => {
  const { themeType } = useTheme(); // Get the current theme (dark or light)

  return (
    <nav
      className="flex justify-between items-center p-4"
      style={{
        backgroundColor: "var(--background)", // Dynamic background from global.css
        color: "var(--foreground)", // Dynamic foreground from global.css
      }}
    >
      <h1 className="text-lg font-bold">CMS Schedule App</h1>
      <div className="relative z-10">
        <CustomDropdown />
      </div>
    </nav>
  );
};

export default Nav;