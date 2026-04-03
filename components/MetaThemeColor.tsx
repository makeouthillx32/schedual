"use client";

import { useEffect } from "react";
import { useTheme } from "@/app/provider";

export default function MetaThemeColor({ type }: { type: "home" | "app" }) {
  const { themeType } = useTheme();

  useEffect(() => {
    const resolveVar = (cssVar: string, contextEl?: Element | null): string => {
      const probe = document.createElement("div");
      probe.style.position = "fixed";
      probe.style.opacity = "0";
      probe.style.pointerEvents = "none";
      probe.style.backgroundColor = `var(${cssVar})`;
      (contextEl ?? document.body).appendChild(probe);
      const resolved = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return resolved;
    };

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

      // If the layout element isn't in the DOM yet, retry until it is
      if (!layoutEl) {
        const id = setTimeout(run, 50);
        return () => clearTimeout(id);
      }

      let color = resolveVar("--lt-status-bar", layoutEl);

      if (!color || color === "rgba(0, 0, 0, 0)") {
        color = resolveVar("--background");
      }

      if (!color || color === "rgba(0, 0, 0, 0)") {
        color = themeType === "dark" ? "#111827" : "#ffffff";
      }

      setMetaColor(color);
    };

    const raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [themeType, type]);

  return null;
}