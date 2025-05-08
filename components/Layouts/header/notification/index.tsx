"use client";

import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BellIcon } from "./icons";

interface NotificationItem {
  image_url: string;
  title: string;
  subtitle: string;
  action_url: string;
}

export function Notification() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDotVisible, setIsDotVisible] = useState(true);
  const [notificationList, setNotificationList] = useState<NotificationItem[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (!res.ok) return;

        const { notifications } = await res.json();
        setNotificationList(notifications);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Dropdown
      isOpen={isOpen}
      setIsOpen={(open) => {
        setIsOpen(open);
        if (setIsDotVisible) setIsDotVisible(false);
      }}
    >
      <DropdownTrigger
        className="grid size-12 place-items-center rounded-full border bg-gray-2 text-dark outline-none hover:text-primary focus-visible:border-primary focus-visible:text-primary dark:border-dark-4 dark:bg-dark-3 dark:text-white dark:focus-visible:border-primary"
        aria-label="View Notifications"
      >
        <span className="relative">
          <BellIcon />
          {isDotVisible && (
            <span
              className={cn(
                "absolute right-0 top-0 z-1 size-2 rounded-full bg-red-light ring-2 ring-gray-2 dark:ring-dark-3"
              )}
            >
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
            {notificationList.length} new
          </span>
        </div>

        <ul className="mb-3 max-h-[23rem] space-y-1.5 overflow-y-auto">
          {notificationList.map((item, index) => (
            <li key={index} role="menuitem">
              <Link
                href={item.action_url || "#"}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-4 rounded-lg px-2 py-1.5 outline-none hover:bg-gray-2 focus-visible:bg-gray-2 dark:hover:bg-dark-3 dark:focus-visible:bg-dark-3"
              >
                <Image
                  src={item.image_url}
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
          ))}
        </ul>
      </DropdownContent>
    </Dropdown>
  );
}
