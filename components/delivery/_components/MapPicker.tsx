"use client";

import React, { useState } from "react";
import { Navigation } from "lucide-react";

interface MapPickerProps {
  address: string;
  /** When provided, renders as a button matching QuickContact action style */
  btnClassName?: string;
}

/**
 * Tap to choose Apple Maps, Google Maps, or Waze.
 * Opens upward and right-anchored so it stays on screen on mobile.
 */
export function MapPicker({ address, btnClassName }: MapPickerProps) {
  const [open, setOpen] = useState(false);
  const enc = encodeURIComponent(address);

  const apps = [
    { label: "Apple Maps",  emoji: "🍎", href: `https://maps.apple.com/?q=${enc}` },
    { label: "Google Maps", emoji: "🗺️", href: `https://www.google.com/maps/search/?api=1&query=${enc}` },
    { label: "Waze",        emoji: "🚗", href: `https://waze.com/ul?q=${enc}&navigate=yes` },
  ];

  return (
    <div className="relative">
      {btnClassName ? (
        // Inside QuickContact — matches the other action buttons
        <button
          onClick={() => setOpen((v) => !v)}
          className={`${btnClassName} bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]`}
        >
          <Navigation size={13} />
          Maps
        </button>
      ) : (
        // No-phone fallback — address text style
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 text-sm text-[hsl(var(--sidebar-primary))] hover:underline"
        >
          📍 {address}
        </button>
      )}

      {open && (
        <>
          {/* Backdrop — closes on outside tap */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          {/* Popover — opens upward, right-anchored */}
          <div className="absolute right-0 bottom-full mb-1.5 z-50 min-w-[160px] rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-lg overflow-hidden">
            {apps.map((app) => (
              <a
                key={app.label}
                href={app.href}
                target="_blank"
                rel="noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] active:bg-[hsl(var(--accent))] transition-colors"
              >
                <span className="text-base leading-none">{app.emoji}</span>
                {app.label}
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}