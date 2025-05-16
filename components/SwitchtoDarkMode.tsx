"use client";

import React, { useEffect, useState } from "react";
import { getCookie } from "@/lib/cookieUtils";
import { useTheme } from "@/app/provider"; // ✅ Get toggleTheme from context

const SwitchtoDarkMode: React.FC = () => {
  const { toggleTheme } = useTheme(); // ✅ Use context directly
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const theme = getCookie("theme");
    setIsDark(theme === "dark");
  }, []);

  const handleClick = () => {
    setIsDark((prev) => !prev);
    toggleTheme();
  };

  return (
    <button
      title="Toggle Theme"
      className="group rounded-full bg-gray-3 p-[5px] text-[#111928] outline-1 outline-primary focus-visible:outline dark:bg-[#020D1A] dark:text-current"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      onClick={handleClick}
    >
      <span className="sr-only">
        Switch to {isDark ? "light" : "dark"} mode
      </span>

      <span aria-hidden className="relative flex gap-2.5">
        <span className="absolute size-[38px] rounded-full border border-gray-200 bg-white transition-all dark:translate-x-[48px] dark:border-none dark:bg-dark-2 dark:group-hover:bg-dark-3" />

        <span
          className={`relative grid size-[38px] place-items-center rounded-full ${!isDark ? 'text-gray-500' : 'dark:text-white'}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`moon-icon ${!isDark ? "visible" : "hidden"}`}
            stroke="currentColor"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </span>

        <span
          className={`relative grid size-[38px] place-items-center rounded-full ${isDark ? 'text-gray-500' : 'dark:text-white'}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`sun-icon ${isDark ? "visible" : "hidden"}`}
            stroke="currentColor"
          >
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        </span>
      </span>
    </button>
  );
};

export default SwitchtoDarkMode;