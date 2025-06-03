"use client";

import React, { useEffect, useState } from "react";
import { getCookie } from "@/lib/cookieUtils";
import { useTheme } from "@/app/provider";

const SwitchtoDarkMode: React.FC = () => {
  const { themeType, toggleTheme } = useTheme();
  const [isDark, setIsDark] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Sync local state with theme context
  useEffect(() => {
    setIsDark(themeType === "dark");
  }, [themeType]);

  // Initialize from cookie on mount
  useEffect(() => {
    const theme = getCookie("theme");
    setIsDark(theme === "dark");
  }, []);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent multiple clicks during transition
    if (isTransitioning) return;
    
    try {
      setIsTransitioning(true);
      
      // Optimistically update UI
      setIsDark((prev) => !prev);
      
      // Trigger smooth theme toggle with the button element
      await toggleTheme(e.currentTarget);
      
    } catch (error) {
      console.error("❌ Theme toggle failed:", error);
      // Revert optimistic update on error
      setIsDark((prev) => !prev);
    } finally {
      // Small delay to prevent rapid clicking
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  return (
    <button
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={`
        theme-toggle-button
        relative
        w-12 h-12
        rounded-full
        bg-background
        border border-border
        text-foreground
        hover:bg-accent hover:text-accent-foreground
        transition-all duration-200
        shadow-sm hover:shadow-md
        active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
        ${isTransitioning ? 'animate-pulse' : ''}
      `}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      onClick={handleClick}
      disabled={isTransitioning}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute inset-0 m-auto"
      >
        {/* Moon (shows in light mode) */}
        <path
          className={`
            moon-icon transition-all duration-300 ease-in-out
            ${!isDark 
              ? "opacity-100 scale-100 rotate-0" 
              : "opacity-0 scale-75 rotate-90"
            }
          `}
          d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        />
        
        {/* Sun (shows in dark mode) */}
        <g 
          className={`
            sun-icon transition-all duration-300 ease-in-out
            ${isDark 
              ? "opacity-100 scale-100 rotate-0" 
              : "opacity-0 scale-75 -rotate-90"
            }
          `}
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
        </g>
      </svg>
      
      {/* Loading indicator overlay for transition state */}
      {isTransitioning && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </button>
  );
};

export default SwitchtoDarkMode;