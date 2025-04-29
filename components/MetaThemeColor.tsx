"use client";

import { useEffect } from "react";
import { useTheme } from "@/app/provider";

export default function MetaThemeColor({ type }: { type: "home" | "app" }) {
  const { themeType } = useTheme();

  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]') || document.createElement("meta");
    meta.setAttribute("name", "theme-color");

    let color = "#ffffff"; // default fallback

    if (type === "home") {
      color = themeType === "dark" ? "#2d3142" : "#ffffff";
    } else if (type === "app") {
      color = themeType === "dark" ? "#111827" : "#f9fafb";
    }

    meta.setAttribute("content", color);
    if (!document.head.contains(meta)) {
      document.head.appendChild(meta);
    }
  }, [themeType, type]);

  return null;
}
