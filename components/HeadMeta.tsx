"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { setCookie } from "@/lib/cookieUtils";

export default function HeadMeta() {
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuthPage =
        pathname === "/sign-in" ||
        pathname === "/sign-up" ||
        pathname.startsWith("/auth");

      if (!isAuthPage) {
        setCookie("lastPage", pathname, { path: "/" });
      }

      const theme = localStorage.getItem("theme");
      setIsDarkMode(theme === "dark");

      let color = "#ffffff";

      if (pathname === "/") {
        color = isDarkMode ? "#111827" : "#f9fafb";
      } else {
        color = isDarkMode ? "#111827" : "#ffffff";
      }

      const metaTag = document.querySelector("meta[name='theme-color']");
      if (metaTag) {
        metaTag.setAttribute("content", color);
      } else {
        const newMeta = document.createElement("meta");
        newMeta.name = "theme-color";
        newMeta.content = color;
        document.head.appendChild(newMeta);
      }
    }
  }, [pathname, isDarkMode]);

  return null;
}