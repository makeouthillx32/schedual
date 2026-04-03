"use client";

import { useEffect } from "react";
import { useTheme } from "@/app/provider";

export default function MetaThemeColor({ type }: { type: "home" | "app" }) {
  const { themeType } = useTheme();

  useEffect(() => {
    const setMetaColor = (color: string) => {
      let meta = document.querySelector(
        'meta[name="theme-color"]'
      ) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "theme-color");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", color);
    };

    const run = () => {
      const selector =
        type === "app" ? '[data-layout="app"]' : '[data-layout="shop"]';
      const layoutEl = document.querySelector(selector);

      if (!layoutEl) {
        // Element not mounted yet — retry in 50ms
        setTimeout(run, 50);
        return;
      }

      // Read the actual resolved background color directly from the element.
      // This is the same technique that works in the dashboard — no CSS var
      // chain guessing, just the final computed rgb(...) value the browser sees.
      const bg = getComputedStyle(layoutEl).backgroundColor;

      if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
        setMetaColor(bg);
        return;
      }

      // Element has transparent bg — fall back to body
      const bodyBg = getComputedStyle(document.body).backgroundColor;
      if (bodyBg && bodyBg !== "rgba(0, 0, 0, 0)") {
        setMetaColor(bodyBg);
        return;
      }

      // Final fallback
      setMetaColor(themeType === "dark" ? "#111827" : "#ffffff");
    };

    // rAF ensures the DOM has painted before we read computed styles
    const raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [themeType, type]);

  return null;
}