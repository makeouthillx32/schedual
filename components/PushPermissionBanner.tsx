"use client";

import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Bell, BellOff, X } from "lucide-react";
import { useState } from "react";

/**
 * Shown inline in the app header (nav.tsx) when the user hasn't
 * subscribed to push yet. On iOS this only works when installed
 * to the Home Screen.
 */
export default function PushPermissionBanner() {
  const { state, error, subscribe } = usePushNotifications();
  const [dismissed, setDismissed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  // Only show on default state (never asked) and not dismissed
  if (dismissed || state === "subscribed" || state === "denied" || state === "unsupported" || state === "loading") {
    return null;
  }

  const handleSubscribe = async () => {
    setSubscribing(true);
    await subscribe();
    setSubscribing(false);
  };

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border"
      style={{
        background:   "hsl(var(--sidebar-primary) / 0.1)",
        borderColor:  "hsl(var(--sidebar-primary) / 0.3)",
        color:        "hsl(var(--sidebar-primary))",
      }}
    >
      <Bell size={13} className="shrink-0" />
      <span className="whitespace-nowrap">Enable delivery alerts</span>
      <button
        onClick={handleSubscribe}
        disabled={subscribing}
        className="ml-1 px-2 py-0.5 rounded text-xs font-bold bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {subscribing ? "…" : "Enable"}
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="p-0.5 rounded hover:bg-[hsl(var(--accent))] transition-colors"
        title="Dismiss"
      >
        <X size={12} />
      </button>
      {error && (
        <span className="text-red-500 text-xs truncate max-w-[120px]" title={error}>
          {error}
        </span>
      )}
    </div>
  );
}