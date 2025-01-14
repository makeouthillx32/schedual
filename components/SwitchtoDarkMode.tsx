"use client";

import React from "react";
import { useTheme } from "@/app/provider"; // Reintroduce the useTheme hook

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
    </div>
  );
};

export default SwitchtoDarkMode;