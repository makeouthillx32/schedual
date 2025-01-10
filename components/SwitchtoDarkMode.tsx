"use client";"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "@/app/providers";

const SwitchtoDarkMode: React.FC = () => {
  const { themeType, toggleTheme } = useTheme();
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
        aria-label="Toggle Dark Mode"
      />
      <label
        htmlFor="toggle"
        className={`relative flex items-center justify-center w-10 h-5 rounded-full ${
          themeType === "dark" ? "bg-gray-700" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute w-4 h-4 rounded-full bg-white transition-transform ${
            isChecked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </label>
    </div>
  );
};

export default SwitchtoDarkMode;

import React from "react";
import { useTheme } from "@/app/providers";

const SwitchtoDarkMode: React.FC = () => {
  const { themeType, toggleTheme } = useTheme();

  return (
    <button
      aria-label="Toggle Dark Mode"
      onClick={toggleTheme}
      className="p-2 rounded focus:outline-none"
    >
      {themeType === "dark" ? "🌙" : "☀️"}
    </button>
  );
};

export default SwitchtoDarkMode;