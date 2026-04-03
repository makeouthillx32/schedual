"use client";

import { useEffect } from "react";
import { useTheme } from "@/app/provider";

export default function MetaThemeColor({ type }: { type: "home" | "app" }) {
  const { themeType } = useTheme();

  useEffect(() => {
    const setMetaColor = (color: string) => {
      let meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "theme-color");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", color);
    };

    const run = () => {
      const selector = type === "app" ? '[data-layout="app"]' : '[data-layout="shop"]';
      const layoutEl = document.querySelector(selector);

      if (!layoutEl) {
        // Element not mounted yet — retry
        setTimeout(run, 50);
        return;
      }

      // Read the actual computed background color of the header element directly
      // This always matches what the user sees — no CSS var chain needed
      const bg = getComputedStyle(layoutEl).backgroundColor;

      if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
        setMetaColor(bg);
      } else {
        // Header has no background (transparent) — fall back to body bg
        const bodyBg = getComputedStyle(document.body).backgroundColor;
        setMetaColor(bodyBg && bodyBg !== "rgba(0, 0, 0, 0)" ? bodyBg : themeType === "dark" ? "#111827" : "#ffffff");
      }
    };

    const raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [themeType, type]);

  return null;
}