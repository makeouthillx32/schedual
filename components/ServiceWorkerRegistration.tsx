"use client";

import { useEffect } from "react";

/**
 * Drop this anywhere in the root layout (or app/layout.tsx).
 * Registers the service worker silently on mount.
 * Must be a client component — no UI, no render output.
 */
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        console.log("[SW] Registered, scope:", reg.scope);
      })
      .catch((err) => {
        console.error("[SW] Registration failed:", err);
      });
  }, []);

  return null;
}