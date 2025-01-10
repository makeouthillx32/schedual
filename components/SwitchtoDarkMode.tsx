"use client";

import React from "react";
import { useTheme } from "@/app/providers";

const SwitchtoDarkMode: React.FC = () => {
  const { themeType, toggleTheme } = useTheme();

  return (
    <button
      aria-label="Toggle Dark Mode"
      onClick={toggleTheme}
      className="p-2 rounded focus:outline-none"
    >
      {themeType === "dark" ? "🌙" : "☀️"}
    </button>
  );
};

export default SwitchtoDarkMode;