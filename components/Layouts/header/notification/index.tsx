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
        className="grid size-12 place-items-center rounded-full border bg-gray-2 text-dark outline-none hover:text-primary focus-visible:border-primary focus-visible:text-primary dark:border-dark-4 dark:bg-dark-3 dark:text-white dark:focus-visible:border-primary"
        aria-label="View Notifications"
      >
        <span className="relative">
          <BellIcon />
          {newNotificationCount > 0 && (
            <span className="absolute right-0 top-0 z-1 size-2 rounded-full bg-red-light ring-2 ring-gray-2 dark:ring-dark-3">
              <span className="absolute inset-0 -z-1 animate-ping rounded-full bg-red-light opacity-75" />
            </span>
          )}
        </span>
      </DropdownTrigger>

      <DropdownContent
        align={isMobile ? "end" : "center"}
        className="border border-stroke bg-white px-3.5 py-3 shadow-md dark:border-dark-3 dark:bg-gray-dark min-[350px]:min-w-[20rem]"
      >
        <div className="mb-1 flex items-center justify-between px-2 py-1.5">
          <span className="text-lg font-medium text-dark dark:text-white">
            Notifications
          </span>
          <span className="rounded-md bg-primary px-[9px] py-0.5 text-xs font-medium text-white">
            {notifications.length} new
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-pulse h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-700"></div>
          </div>
        ) : (
          <ul className="mb-3 max-h-[23rem] space-y-1.5 overflow-y-auto">
            {notifications.length === 0 ? (
              <li className="text-center py-4 text-gray-500 dark:text-gray-400">
                No notifications
              </li>
            ) : (
              notifications.map((item, index) => (
                <li key={index} role="menuitem">
                  <Link
                    href={item.action_url || "#"}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-4 rounded-lg px-2 py-1.5 outline-none hover:bg-gray-2 focus-visible:bg-gray-2 dark:hover:bg-dark-3 dark:focus-visible:bg-dark-3"
                  >
                    <Image
                      src={item.image_url || "/default-avatar.png"}
                      className="size-14 rounded-full object-cover"
                      width={200}
                      height={200}
                      alt="User"
                    />
                    <div>
                      <strong className="block text-sm font-medium text-dark dark:text-white">
                        {item.title}
                      </strong>
                      <span className="truncate text-sm font-medium text-dark-5 dark:text-dark-6">
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