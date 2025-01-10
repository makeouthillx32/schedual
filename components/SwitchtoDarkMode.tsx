"use client";

import React from "react";
import { useTheme } from "@/app/providers"; // Correct absolute path to `providers.tsx`/ Correct relative path // Use the correct absolute path // Adjust path relative to the component's location

const SwitchtoDarkMode = () => {
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
      <label htmlFor="toggle" className="ml-2">
        {themeType === "dark" ? "Dark Mode" : "Light Mode"}
      </label>
    </div>
  );
};

export default SwitchtoDarkMode;