// components/Layouts/header/notification/index.tsx
"use client";

import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/Layouts/appheader/dropdown";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { BellIcon } from "./icons";

export function Notification() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, newNotificationCount, markAsRead, loading } = useRealtimeNotifications();
  const isMobile = useIsMobile();
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      markAsRead();
    }
  };

  return (
    <Dropdown
      isOpen={isOpen}
      setIsOpen={handleOpenChange}
    >
      <DropdownTrigger
        className="grid size-12 place-items-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] outline-none hover:text-[hsl(var(--sidebar-primary))] focus-visible:border-[hsl(var(--sidebar-primary))] focus-visible:text-[hsl(var(--sidebar-primary))] dark:border-[hsl(var(--sidebar-border))] dark:bg-[hsl(var(--secondary))] dark:text-[hsl(var(--card-foreground))] dark:focus-visible:border-[hsl(var(--sidebar-primary))]"
        aria-label="View Notifications"
      >
        <span className="relative">
          <BellIcon />
          {newNotificationCount > 0 && (
            <span className="absolute right-0 top-0 z-1 size-2 rounded-full bg-[hsl(var(--destructive))] ring-2 ring-[hsl(var(--muted))] dark:ring-[hsl(var(--secondary))]">
              <span className="absolute inset-0 -z-1 animate-ping rounded-full bg-[hsl(var(--destructive))] opacity-75" />
            </span>
          )}
        </span>
      </DropdownTrigger>

      <DropdownContent
        align={isMobile ? "end" : "center"}
        className="border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3.5 py-3 shadow-[var(--shadow-md)] dark:border-[hsl(var(--sidebar-border))] dark:bg-[hsl(var(--card))] min-[350px]:min-w-[20rem]"
      >
        <div className="mb-1 flex items-center justify-between px-2 py-1.5">
          <span className="text-lg font-medium text-[hsl(var(--foreground))] dark:text-[hsl(var(--card-foreground))]">
            Notifications
          </span>
          <span className="rounded-md bg-[hsl(var(--sidebar-primary))] px-[9px] py-0.5 text-xs font-medium text-[hsl(var(--sidebar-primary-foreground))]">
            {notifications.length} new
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-pulse h-8 w-8 rounded-full bg-[hsl(var(--muted))] dark:bg-[hsl(var(--secondary))]"></div>
          </div>
        ) : (
          <ul className="mb-3 max-h-[23rem] space-y-1.5 overflow-y-auto">
            {notifications.length === 0 ? (
              <li className="text-center py-4 text-[hsl(var(--muted-foreground))] dark:text-[hsl(var(--muted-foreground))]">
                No notifications
              </li>
            ) : (
              notifications.map((item, index) => (
                <li key={index} role="menuitem">
                  <Link
                    href={item.action_url || "#"}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-4 rounded-[var(--radius)] px-2 py-1.5 outline-none hover:bg-[hsl(var(--muted))] focus-visible:bg-[hsl(var(--muted))] dark:hover:bg-[hsl(var(--secondary))] dark:focus-visible:bg-[hsl(var(--secondary))]"
                  >
                    <Image
                      src={item.image_url || "/default-avatar.png"}
                      className="size-14 rounded-full object-cover"
                      width={200}
                      height={200}
                      alt="User"
                    />
                    <div>
                      <strong className="block text-sm font-medium text-[hsl(var(--foreground))] dark:text-[hsl(var(--card-foreground))]">
                        {item.title}
                      </strong>
                      <span className="truncate text-sm font-medium text-[hsl(var(--muted-foreground))] dark:text-[hsl(var(--muted-foreground))]">
                        {item.subtitle}
                      </span>
                    </div>
                  </Link>
                </li>
              ))
            )}
          </ul>
        )}
      </DropdownContent>
    </Dropdown>
  );
}