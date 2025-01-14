"use client";

import React from "react";
import { useTheme } from "@/app/provider";
import SwitchtoDarkMode from "./SwitchtoDarkMode";

const Nav: React.FC = () => {
  const { themeType } = useTheme();

  return (
    <nav
      className={`flex justify-between items-center p-4 ${
        themeType === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}
    >
      <h1 className="text-lg font-bold">CMS Schedule App</h1>
      <SwitchtoDarkMode />
    </nav>
  );
};

export default Nav;