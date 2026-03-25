"use client";

import { Phone, MessageSquare } from "lucide-react";
import { MapPicker } from "./MapPicker";

interface QuickContactProps {
  phone:         string;
  name:          string;
  address:       string | null;
  scheduledTime?: string;
  orderType:     "delivery" | "pickup";
}

/**
 * One-tap call, map picker, and pre-written SMS templates.
 *
 * URL schemes used:
 *   tel:  → opens iPhone Phone app
 *   sms:  → opens iMessage with &body= pre-filled (user edits before sending)
 *
 * Messages are sent from YOUR company iPhone — no third-party service needed.
 */
export function QuickContact({ phone, name, address, scheduledTime, orderType }: QuickContactProps) {
  const bare = phone.replace(/\D/g, "");

  const messages = [
    {
      label: "On my way",
      emoji: "🚗",
      body:  `Hi ${name}, this is DART Thrift — we're on our way${scheduledTime ? ` for your ${scheduledTime} appointment` : ""}! We'll see you shortly.`,
    },
    {
      label: "Running late",
      emoji: "⏰",
      body:  `Hi ${name}, this is DART Thrift — we're running a little behind schedule. We'll be there as soon as we can. Thank you for your patience!`,
    },
    {
      label: orderType === "pickup" ? "Ready to load" : "Arrived",
      emoji: orderType === "pickup" ? "📦" : "✅",
      body:  orderType === "pickup"
        ? `Hi ${name}, this is DART Thrift — we've arrived and are ready to load up. Please come out when you're ready!`
        : `Hi ${name}, this is DART Thrift — we're outside and ready to deliver your item. Please come out or let us know where to bring it!`,
    },
  ];

  const btnBase = "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors active:scale-95";

  return (
    <div className="space-y-2">
      {/* Call + Maps row */}
      <div className="flex gap-2">
        <a
          href={`tel:${bare}`}
          className={`${btnBase} flex-1 justify-center bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] hover:bg-[hsl(var(--sidebar-primary))]/90`}
        >
          <Phone size={13} />
          Call {phone}
        </a>
        {address && <MapPicker address={address} btnClassName={btnBase} />}
      </div>

      {/* SMS quick-send row */}
      <div className="space-y-1">
        <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium flex items-center gap-1">
          <MessageSquare size={11} /> Quick text — tap to open iMessage, edit &amp; send
        </p>
        <div className="flex flex-col gap-1.5">
          {messages.map((msg) => (
            <a
              key={msg.label}
              href={`sms:${bare}&body=${encodeURIComponent(msg.body)}`}
              className={`${btnBase} bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] justify-start`}
            >
              <span className="text-base leading-none">{msg.emoji}</span>
              <span>{msg.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}