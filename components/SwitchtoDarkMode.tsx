"use client";

import React from "react";

interface SwitchtoDarkModeProps {
  themeType: "dark" | "light";
  toggleTheme: () => void;
}

const SwitchtoDarkMode: React.FC<SwitchtoDarkModeProps> = ({ themeType, toggleTheme }) => {
  const iconClass = themeType === "dark" ? "toggle moon" : "toggle";

  return (
    <div className="flex items-center">
      <input
        id="toggle"
        className={iconClass}
        type="checkbox"
        checked={themeType === "dark"}
        onChange={toggleTheme}
      />
    </div>
  );
};

export default SwitchtoDarkMode;