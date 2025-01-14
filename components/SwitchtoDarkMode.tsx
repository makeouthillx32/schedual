"use client";

import React, { useEffect, useState } from "react";

interface SwitchtoDarkModeProps {
  themeType: "dark" | "light";
  toggleTheme: () => void;
}

const SwitchtoDarkMode: React.FC<SwitchtoDarkModeProps> = ({ themeType, toggleTheme }) => {
  const [checked, setChecked] = useState(themeType === "dark");

  useEffect(() => {
    // Ensure the toggle reflects the current themeType when it changes
    setChecked(themeType === "dark");
  }, [themeType]);

  const handleToggle = () => {
    toggleTheme();
    setChecked((prev) => !prev);
  };

  return (
    <div className="flex items-center">
      <input
        id="toggle"
        className="toggle"
        type="checkbox"
        checked={checked}
        onChange={handleToggle}
      />
    </div>
  );
};

export default SwitchtoDarkMode;