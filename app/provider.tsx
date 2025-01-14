"use client";

import React, { useState, useEffect } from "react";
import { setCookie, getCookie } from "@/lib/cookieUtils";

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeType, setThemeType] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const savedTheme = getCookie("theme");
      return savedTheme === "dark" ? "dark" : "light";
    }
    return "light"; // Default to light during SSR
  });

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", themeType);
      setCookie("theme", themeType, { path: "/", maxAge: 31536000 }); // 1-year expiration
    }
  }, [themeType]);

  const toggleTheme = () => {
    setThemeType((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <div>
      {children}
    </div>
  );
};