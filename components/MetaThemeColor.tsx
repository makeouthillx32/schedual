"use client";

import { useEffect } from "react";
import { useTheme } from "@/app/provider";

export default function MetaThemeColor({ type }: { type: "home" | "app" }) {
  const { themeType } = useTheme();
  const isDark = themeType === "dark";

  useEffect(() => {
    // Function to get computed CSS variable value
    const getCSSVariable = (variable: string): string => {
      const root = document.documentElement;
      const value = getComputedStyle(root).getPropertyValue(variable).trim();
      return value || '';
    };

    const meta = document.querySelector('meta[name="theme-color"]') || document.createElement("meta");
    meta.setAttribute("name", "theme-color");

    let color;

    if (type === "home") {
      // For home, use sidebar color for dark mode and background for light mode
      color = isDark 
        ? getCSSVariable('--sidebar') 
        : getCSSVariable('--background');
    } else {
      // For app, use background color for both modes
      color = getCSSVariable('--background');
    }

    // Ensure we have a valid color or fall back to defaults
    if (!color || !color.startsWith('#') && !color.startsWith('hsl') && !color.startsWith('rgb')) {
      color = isDark ? "#111827" : "#ffffff";
    }

    meta.setAttribute("content", color);
    
    if (!document.head.contains(meta)) {
      document.head.appendChild(meta);
    }
  }, [themeType, type, isDark]);

  return null;
}