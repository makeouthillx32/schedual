"use client";

import React from "react";
import { useTheme } from "@/app/provider";

interface SwitchtoDarkModeProps {
  toggleTheme: () => void;
}

const SwitchtoDarkMode: React.FC<SwitchtoDarkModeProps> = ({ toggleTheme }) => {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    <div className="flex items-center">
      <input
        id="toggle"
        className="toggle"
        type="checkbox"
        onChange={toggleTheme}
      />
    </div>
  );
};

export default SwitchtoDarkMode;