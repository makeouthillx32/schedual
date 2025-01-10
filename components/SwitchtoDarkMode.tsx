"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "@/app/layout";

const SwitchtoDarkMode: React.FC = () => {
  const { themeType, toggleTheme } = useTheme();
  const [isChecked, setIsChecked] = useState(themeType === "dark");

  useEffect(() => {
    setIsChecked(themeType === "dark");
  }, [themeType]);

  return (
    <div className="flex items-center">
      <label htmlFor="dark-mode-toggle" className="sr-only">
        Toggle Dark Mode
      </label>
      <input
        id="dark-mode-toggle"
        className="toggle"
        type="checkbox"
        checked={isChecked}
        onChange={toggleTheme}
      />
    </div>
  );
};

export default SwitchtoDarkMode;