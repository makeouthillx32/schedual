"use client";

import React from "react";

interface SwitchtoDarkModeProps {
  themeType: "dark" | "light";
  toggleTheme: () => void;
}

const SwitchtoDarkMode: React.FC<SwitchtoDarkModeProps> = ({ themeType, toggleTheme }) => {
  return (
    <div className="flex items-center">
      <input
        id="toggle"
        className="toggle"
        type="checkbox"
        checked={themeType === "dark"}
        onChange={toggleTheme}
      />
      <label htmlFor="toggle" className="ml-2">
        {themeType === "dark" ? "Dark Mode" : "Light Mode"}
      </label>
    </div>
  );
};

export default SwitchtoDarkMode;