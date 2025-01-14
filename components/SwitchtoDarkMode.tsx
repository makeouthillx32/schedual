"use client";

import React from "react";
import { useTheme } from "@/app/provider";

const SwitchtoDarkMode: React.FC = () => {
  const { themeType, toggleTheme } = useTheme();

  return (
    <div className="flex items-center">
      <input
        id="toggle"
        className="toggle"
        type="checkbox"
        checked={themeType === "dark"}
        onChange={toggleTheme}
      />
      <label htmlFor="toggle" className="sr-only">
        Toggle Dark Mode
      </label>
    </div>
  );
};

export default SwitchtoDarkMode;