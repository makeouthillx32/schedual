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

/**
 * Read the RESOLVED value of a CSS custom property by injecting a probe
 * element into the DOM. This forces the browser to compute the chain
 * (e.g. var(--gp-bg) → hsl(var(--destructive)) → rgb(239,68,68)).
 *
 * We use background-color because it's a color property the browser resolves
 * eagerly, and getComputedStyle on a real element returns the final rgb().
 */
function resolveStatusBarColor(): string | null {
  const probe = document.createElement("div");
  // --gp-status-bar is defined on :root and always mirrors --gp-bg.
  // This probe lives outside any layout element so it reads :root tokens.
  probe.style.cssText =
    "position:fixed;width:0;height:0;opacity:0;pointer-events:none;" +
    "background-color:var(--gp-status-bar);";
  document.body.appendChild(probe);
  const color = getComputedStyle(probe).backgroundColor;
  document.body.removeChild(probe);

  if (color && color !== "rgba(0, 0, 0, 0)" && color !== "transparent") {
    return color;
  }
  return null;
}

function setMetaColor(color: string) {
  let meta = document.querySelector(
    'meta[name="theme-color"]'
  ) as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", color);
}

export default function MetaThemeColor({ type }: { type: "home" | "app" }) {
  const { themeType } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    let attempts = 0;
    const MAX_ATTEMPTS = 10;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const run = () => {
      attempts++;

      // --- Strategy 1: Read backgroundColor from the mounted layout element ---
      // This is the most accurate because it resolves the full CSS chain including
      // any scoped tokens from layout-tokens.css.
      const layoutEl =
        document.querySelector('[data-layout="app"]') ||
        document.querySelector('[data-layout="shop"]') ||
        document.querySelector('[data-layout="dashboard"]') ||
        document.querySelector('[data-layout="home"]');

      if (layoutEl) {
        const bg = getComputedStyle(layoutEl).backgroundColor;
        if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
          setMetaColor(rgbToHex(bg));
          return;
        }
      }

      // --- Strategy 2: Probe :root for --gp-status-bar ---
      // This works even before the layout element is painted, because
      // --gp-status-bar is defined on :root and doesn't depend on a
      // [data-layout] element being visible.
      const probeColor = resolveStatusBarColor();
      if (probeColor) {
        setMetaColor(rgbToHex(probeColor));
        // Don't return yet — keep retrying so that if the layout element
        // mounts later with a different scoped token, we pick it up.
        if (layoutEl) return; // Layout element was found, bg was just transparent — stop.
      }

      // --- Retry if we haven't exceeded max attempts ---
      if (attempts < MAX_ATTEMPTS) {
        timeoutId = setTimeout(run, 50);
      }
      // After MAX_ATTEMPTS, give up — probe color is our best answer.
    };

    // rAF ensures at least one paint has happened before we read computed styles.
    const raf = requestAnimationFrame(run);

    return () => {
      cancelAnimationFrame(raf);
      if (timeoutId !== null) clearTimeout(timeoutId);
    };
  }, [themeType, type, pathname]);

  return null;
}