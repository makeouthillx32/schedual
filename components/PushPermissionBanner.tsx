"use client";

import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Bell, X } from "lucide-react";
import { useState, useEffect } from "react";

/**
 * Shown inline in nav.tsx when push notifications haven't been enabled yet.
 *
 * iOS requirements:
 *   - App must be installed to Home Screen (standalone PWA mode)
 *   - iOS 16.4+
 *
 * The 1.5s settle delay prevents a false-positive flash while the
 * service worker state resolves on first load.
 */
export default function PushPermissionBanner() {
  const { state, error, subscribe } = usePushNotifications();
  const [dismissed,   setDismissed]   = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [settled,     setSettled]     = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSettled(true), 1500);
    return () => clearTimeout(t);
  }, []);

  // Already handled — hide
  if (dismissed || state === "subscribed" || state === "denied" || state === "unsupported") {
    return null;
  }
  // Wait for settle
  if (!settled) return null;
  // Only show for actionable states
  if (state !== "default" && state !== "granted") return null;

  const handleSubscribe = async () => {
    setSubscribing(true);
    await subscribe();
    setSubscribing(false);
  };

  return (
    <div
      className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium rounded-lg border shrink-0"
      style={{
        background:  "hsl(var(--sidebar-primary) / 0.1)",
        borderColor: "hsl(var(--sidebar-primary) / 0.3)",
        color:       "hsl(var(--sidebar-primary))",
      }}
    >
      <Bell size={12} className="shrink-0" />
      <span className="whitespace-nowrap hidden sm:inline">Enable alerts</span>
      <button
        onClick={handleSubscribe}
        disabled={subscribing}
        className="px-2 py-0.5 rounded text-xs font-bold bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap"
      >
        {subscribing ? "…" : "Enable"}
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="p-0.5 rounded hover:bg-[hsl(var(--sidebar-primary)/0.2)] transition-colors"
      >
        <X size={11} />
      </button>
      {error && (
        <span className="text-red-500 text-[10px] truncate max-w-[80px]" title={error}>
          {error}
        </span>
      )}
    </div>
  );
}