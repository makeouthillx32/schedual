"use client";

import { useEffect } from "react";
import { useTheme } from "@/app/provider";

/**
 * Sets the iOS/PWA status bar color from the layout-tokens.css system.
 *
 * layout-tokens.css defines --lt-status-bar on each [data-layout] element,
 * always mirroring --gp-bg (the page background). We read it from the
 * nearest [data-layout] ancestor — or fall back to :root --background.
 *
 * This is the single source of truth. The competing approaches in
 * providers.tsx, theme-color-handler.tsx, and ios-status-bar-fix.tsx
 * can be removed once this is confirmed working.
 */
export default function MetaThemeColor({ type }: { type: "home" | "app" }) {
  const { themeType } = useTheme();

  useEffect(() => {
    const root = document.documentElement;
    const computed = getComputedStyle(root);

    // Try to read --lt-status-bar from the nearest [data-layout] element.
    // For "app" type pages the nav has data-layout="app",
    // for "home" we fall back to root background.
    let color = "";

    if (type === "app") {
      // Find the first [data-layout] element on the page
      const layoutEl = document.querySelector("[data-layout]");
      if (layoutEl) {
        color = getComputedStyle(layoutEl)
          .getPropertyValue("--lt-status-bar")
          .trim();
      }
    }

    // Fall back to root --background if no layout element found
    // or if this is a home page
    if (!color) {
      const raw = computed.getPropertyValue("--background").trim();
      // --background is bare HSL components e.g. "240 9.09% 97.84%"
      color = raw.includes("(") ? raw : `hsl(${raw})`;
    }

    // Ensure proper hsl() wrapping
    if (color && !color.startsWith("#") && !color.startsWith("hsl") && !color.startsWith("rgb")) {
      color = `hsl(${color})`;
    }

    // Final fallback
    if (!color) {
      color = themeType === "dark" ? "#111827" : "#ffffff";
    }

    // Set the meta tag
    let meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", color);
  }, [themeType, type]);

  return null;
}