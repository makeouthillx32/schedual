"use client";

import React, { useEffect, useState } from "react";

interface SwitchtoDarkModeProps {
  themeType: "dark" | "light";
  toggleTheme: () => void;
}

const SwitchtoDarkMode: React.FC<SwitchtoDarkModeProps> = ({ themeType, toggleTheme }) => {
  const [isChecked, setIsChecked] = useState(themeType === "dark");

  useEffect(() => {
    setIsChecked(themeType === "dark");
  }, [themeType]);

  const handleToggle = () => {
    toggleTheme();
  };

  return (
    <div className="flex items-center">
      <input
        id="toggle"
        className="toggle"
        type="checkbox"
        checked={isChecked}
        onChange={handleToggle}
      />
      <div className="background"></div>
      <label htmlFor="toggle" className="title">
        Toggle dark mode
      </label>
    </div>
  );
};

export default SwitchtoDarkMode;
