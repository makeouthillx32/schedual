"use client";

import { useLayoutEffect } from "react";

export type MetaLayout = "home" | "dashboard" | "app";

export function useMetaThemeColor(layout: MetaLayout, themeType: "light" | "dark") {
    useLayoutEffect(() => {
        let cancelled = false;
        let lastColor = "";

        const updateStatusBar = () => {
            if (cancelled) return;

            const el = document.querySelector<HTMLElement>(`[data-layout="${layout}"]`);
            if (!el) return;

            const bgColor = getComputedStyle(el).backgroundColor;
            if (!bgColor || bgColor === "transparent" || bgColor === "rgba(0, 0, 0, 0)") return;

            const match = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
            if (!match) return;

            const hex = `#${(
                (1 << 24) +
                (Number(match[1]) << 16) +
                (Number(match[2]) << 8) +
                Number(match[3])
            )
                .toString(16)
                .slice(1)}`;

            if (hex === lastColor) return;
            lastColor = hex;

            let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
            if (!meta) {
                meta = document.createElement("meta");
                meta.name = "theme-color";
                document.head.appendChild(meta);
            }
            meta.content = hex;

            let appleMeta = document.querySelector<HTMLMetaElement>(
                'meta[name="apple-mobile-web-app-status-bar-style"]'
            );
            if (!appleMeta) {
                appleMeta = document.createElement("meta");
                appleMeta.name = "apple-mobile-web-app-status-bar-style";
                document.head.appendChild(appleMeta);
            }
            appleMeta.content = "default";

            // Force Safari to repaint
            el.style.visibility = "hidden";
            el.offsetHeight; // trigger reflow
            el.style.visibility = "visible";
        };

        updateStatusBar();

        const observer = new MutationObserver((mutations) => {
            if (cancelled) return;
            const hasClassChange = mutations.some((m) => m.attributeName === "class");
            if (!hasClassChange) return;
            // Delay past the theme-transition-fallback duration (0.4s) so
            // getComputedStyle reads the final settled color, not a mid-transition frame.
            setTimeout(updateStatusBar, 420);
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class", "style"],
        });

        return () => {
            cancelled = true;
            observer.disconnect();
        };
    }, [layout, themeType]);
}