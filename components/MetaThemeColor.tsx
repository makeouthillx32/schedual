"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "@/app/provider";

/** rgb(r, g, b) → #rrggbb — iOS Safari needs hex for theme-color */
function rgbToHex(rgb: string): string {
  const m = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!m) return rgb;
  return (
    "#" +
    [m[1], m[2], m[3]]
      .map((v) => parseInt(v).toString(16).padStart(2, "0"))
      .join("")
  );
}

export default function MetaThemeColor({ type }: { type: "home" | "app" }) {
  const { themeType } = useTheme();
  const pathname = usePathname();

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
      // Try all layout types so this works regardless of which header is present
      const layoutEl =
        document.querySelector('[data-layout="app"]') ||
        document.querySelector('[data-layout="shop"]') ||
        document.querySelector('[data-layout="dashboard"]');

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
        // iOS Safari requires hex format — rgb() is not reliably honored
        setMetaColor(rgbToHex(bg));
        return;
      }

      // Element has transparent bg — fall back to body
      const bodyBg = getComputedStyle(document.body).backgroundColor;
      if (bodyBg && bodyBg !== "rgba(0, 0, 0, 0)") {
        setMetaColor(rgbToHex(bodyBg));
        return;
      }

      // Final fallback — use the known brand color
      setMetaColor(themeType === "dark" ? "#ef4444" : "#ef4444");
    };

    // rAF ensures the DOM has painted before we read computed styles
    const raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [themeType, type, pathname]);

  return null;
}
