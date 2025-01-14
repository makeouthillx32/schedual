"use client";

import React from "react";
import SwitchtoDarkMode from "./SwitchtoDarkMode";
import { CustomDropdown } from "./ui/dropdown-menu";
import { useTheme } from "@/app/provider";

const Nav: React.FC = () => {
  const { themeType } = useTheme(); // Access themeType from provider

  return (
    <nav
      className="flex justify-between items-center p-4"
      style={{
        backgroundColor: "var(--background)", // Use dynamic background color
        color: "var(--foreground)", // Use dynamic foreground color
      }}
    >
      <h1 className="text-lg font-bold">CMS Schedule App</h1>
      <div className="flex items-center gap-4">
        <SwitchtoDarkMode themeType={themeType} />
        <div className="relative z-10">
          <CustomDropdown />
        </div>
      </div>
    </nav>
  );
};

export default Nav;