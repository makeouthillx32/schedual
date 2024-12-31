"use client";

import React, { useState, useEffect } from "react";

interface SwitchtoDarkModeProps {
  themeType: "dark" | "light";
  toggleTheme: () => void;
}

const SwitchtoDarkMode: React.FC<SwitchtoDarkModeProps> = ({
  themeType,
  toggleTheme,
}) => {
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    setIsChecked(themeType === "dark");
  }, [themeType]);

  const handleToggle = () => {
    setIsChecked((prev) => !prev);
    toggleTheme();
  };

  return (
    <div className="relative flex items-center justify-center">
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
