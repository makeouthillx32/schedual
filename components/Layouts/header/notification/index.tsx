// components/Layouts/header/notification/index.tsx
"use client";

import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/Layouts/appheader/dropdown";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from "react";
import { BellIcon } from "./icons";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Notification {
  id: string;
  sender_id: string | null;
  receiver_id: string | null;
  type: string;
  title: string;
  content: string;
  subtitle: string;
  metadata?: any;
  image_url: string | null;
  action_url: string | null;
  is_read: boolean;
  created_at: string;
  role_admin: boolean;
  role_jobcoach: boolean;
  role_client: boolean;
  role_user: boolean;
}

interface StackedNotification {
  id: string;
  type: string;
  sender_id: string | null;
  sender_name: string;
  title: string;
  content: string;
  image_url: string | null;
  action_url: string | null;
  created_at: string;
  count: number;
  isStacked: boolean;
  notifications: Notification[];
}

interface NotificationProps {
  /**
   * When true — only show message-type notifications.
   * Used on app pages (/CMS, /Delivery, /Tools) so that
   * task completions, payments, team joins etc. stay in dashboard only.
   */
  messagesOnly?: boolean;
}

// Types that are shown everywhere (app pages + dashboard)
const APP_ALLOWED_TYPES = new Set(["message"]);

export function Notification({ messagesOnly = false }: NotificationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedStacks, setExpandedStacks] = useState<Set<string>>(new Set());
  const { notifications, newNotificationCount, markAsRead, loading } = useRealtimeNotifications();
  const isMobile = useIsMobile();

  // ── Build stacked/grouped notifications ──────────────────────────────────
  const stackedNotifications = useMemo(() => {
    const stacked: StackedNotification[] = [];
    const messageGroups: { [key: string]: Notification[] } = {};

    notifications.forEach((notification) => {
      const isMessage =
        notification.type === "message" ||
        notification.title?.includes("sent you a message") ||
        notification.title?.includes("sent you messages");

      // On app pages: skip anything that isn't a message
      if (messagesOnly && !isMessage) return;

      if (isMessage && notification.sender_id) {
        const groupKey = `message-${notification.sender_id}-${notification.receiver_id}`;
        if (!messageGroups[groupKey]) messageGroups[groupKey] = [];
        messageGroups[groupKey].push(notification);
      } else {
        const senderName =
          notification.metadata?.sender_name ||
          notification.title.split(" ")[0] ||
          "Someone";

        stacked.push({
          id: notification.id,
          type: notification.type || "general",
          sender_id: notification.sender_id,
          sender_name: senderName,
          title: notification.title,
          content: notification.content || notification.subtitle || "",
          image_url: notification.image_url,
          action_url: notification.action_url,
          created_at: notification.created_at,
          count: 1,
          isStacked: false,
          notifications: [notification],
        });
      }
    });

    Object.entries(messageGroups).forEach(([groupKey, group]) => {
      const sortedGroup = group.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const latest = sortedGroup[0];
      const senderName =
        latest.metadata?.sender_name ||
        latest.title
          .replace(" sent you a message", "")
          .replace(" sent you messages", "") ||
        "Someone";

      stacked.push({
        id: groupKey,
        type: "message",
        sender_id: latest.sender_id,
        sender_name: senderName,
        title:
          group.length === 1
            ? `${senderName} sent you a message`
            : `${senderName} sent you ${group.length} messages`,
        content: latest.content || latest.subtitle || "",
        image_url: latest.image_url,
        action_url: latest.action_url,
        created_at: latest.created_at,
        count: group.length,
        isStacked: group.length > 1,
        notifications: sortedGroup,
      });
    });

    return stacked.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [notifications, messagesOnly]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) markAsRead();
  };

  const toggleStackExpansion = (stackId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedStacks((prev) => {
      const next = new Set(prev);
      next.has(stackId) ? next.delete(stackId) : next.add(stackId);
      return next;
    });
  };

  const formatTimeAgo = (timestamp: string) => {
    const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000);
    if (diff < 1) return "just now";
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  const totalUnreadCount = useMemo(
    () => stackedNotifications.reduce((t, s) => t + s.count, 0),
    [stackedNotifications]
  );

  return (
    <Dropdown isOpen={isOpen} setIsOpen={handleOpenChange}>
      <DropdownTrigger
        className="grid size-12 place-items-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] outline-none hover:text-[hsl(var(--sidebar-primary))] focus-visible:border-[hsl(var(--sidebar-primary))] focus-visible:text-[hsl(var(--sidebar-primary))] dark:border-[hsl(var(--sidebar-border))] dark:bg-[hsl(var(--secondary))] dark:text-[hsl(var(--card-foreground))] dark:focus-visible:border-[hsl(var(--sidebar-primary))]"
        aria-label="View Notifications"
      >
        <span className="relative">
          <BellIcon />
          {totalUnreadCount > 0 && (
            <span className="absolute right-0 top-0 z-1 size-2 rounded-full bg-[hsl(var(--destructive))] ring-2 ring-[hsl(var(--muted))] dark:ring-[hsl(var(--secondary))]">
              <span className="absolute inset-0 -z-1 animate-ping rounded-full bg-[hsl(var(--destructive))] opacity-75" />
            </span>
          )}
        </span>
      </DropdownTrigger>

      <DropdownContent
        align={isMobile ? "end" : "center"}
        className={`
          border border-[hsl(var(--border))] bg-[hsl(var(--background))] shadow-[var(--shadow-md)] 
          dark:border-[hsl(var(--sidebar-border))] dark:bg-[hsl(var(--card))]
          ${isMobile
            ? "fixed top-16 right-2 left-2 mx-auto max-w-sm px-2 py-2"
            : "px-3.5 py-3 min-[350px]:min-w-[20rem]"
          }
        `}
        style={isMobile ? { maxHeight: "calc(100vh - 5rem)", overflowY: "auto", zIndex: 9999 } : {}}
      >
        <div className={`mb-1 flex items-center justify-between py-1.5 ${isMobile ? "px-1" : "px-2"}`}>
          <span className={`font-medium text-[hsl(var(--foreground))] dark:text-[hsl(var(--card-foreground))] ${isMobile ? "text-base" : "text-lg"}`}>
            {messagesOnly ? "Messages" : "Notifications"}
          </span>
          <span className="rounded-md bg-[hsl(var(--sidebar-primary))] px-[9px] py-0.5 text-xs font-medium text-[hsl(var(--sidebar-primary-foreground))]">
            {totalUnreadCount} new
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-pulse h-8 w-8 rounded-full bg-[hsl(var(--muted))] dark:bg-[hsl(var(--secondary))]" />
          </div>
        ) : (
          <ul className={`mb-3 space-y-1.5 overflow-y-auto ${isMobile ? "max-h-[calc(100vh-10rem)]" : "max-h-[23rem]"}`}>
            {stackedNotifications.length === 0 ? (
              <li className="text-center py-4 text-[hsl(var(--muted-foreground))]">
                {messagesOnly ? "No messages" : "No notifications"}
              </li>
            ) : (
              stackedNotifications.map((item, index) => {
                const isExpanded = expandedStacks.has(item.id);
                return (
                  <li key={`${item.id}-${index}`} role="menuitem">
                    <div className="relative">
                      <Link
                        href={item.action_url || "#"}
                        onClick={() => setIsOpen(false)}
                        className={`
                          flex items-center rounded-[var(--radius)] outline-none 
                          hover:bg-[hsl(var(--muted))] focus-visible:bg-[hsl(var(--muted))] 
                          dark:hover:bg-[hsl(var(--secondary))] dark:focus-visible:bg-[hsl(var(--secondary))]
                          ${isMobile ? "gap-3 px-1 py-2" : "gap-4 px-2 py-1.5"}
                        `}
                      >
                        <div className="relative flex-shrink-0">
                          <Image
                            src={item.image_url || "/default-avatar.png"}
                            className={`rounded-full object-cover ${isMobile ? "size-10" : "size-14"}`}
                            width={isMobile ? 40 : 56}
                            height={isMobile ? 40 : 56}
                            alt="User"
                          />
                          {item.isStacked && item.count > 1 && (
                            <span className={`absolute -top-1 -right-1 z-10 flex items-center justify-center rounded-full bg-[hsl(var(--destructive))] text-xs font-bold text-white ring-2 ring-[hsl(var(--background))] ${isMobile ? "size-5" : "size-6"}`}>
                              {item.count > 9 ? "9+" : item.count}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <strong className={`block font-medium text-[hsl(var(--foreground))] dark:text-[hsl(var(--card-foreground))] ${isMobile ? "text-sm leading-tight" : "text-sm"}`}>
                            {item.title}
                          </strong>
                          <span className={`block font-medium text-[hsl(var(--muted-foreground))] ${isMobile ? "text-xs leading-tight" : "text-sm"}`}>
                            {item.isStacked ? `Latest: ${item.content}` : item.content}
                          </span>
                          <span className="block text-xs text-[hsl(var(--muted-foreground))] mt-1">
                            {formatTimeAgo(item.created_at)}
                          </span>
                        </div>
                      </Link>

                      {item.isStacked && (
                        <button
                          onClick={(e) => toggleStackExpansion(item.id, e)}
                          className={`absolute top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[hsl(var(--muted))] dark:hover:bg-[hsl(var(--secondary))] transition-colors ${isMobile ? "right-1" : "right-2"}`}
                          aria-label={isExpanded ? "Collapse messages" : "Expand messages"}
                        >
                          {isExpanded
                            ? <ChevronUp size={isMobile ? 14 : 16} className="text-[hsl(var(--muted-foreground))]" />
                            : <ChevronDown size={isMobile ? 14 : 16} className="text-[hsl(var(--muted-foreground))]" />
                          }
                        </button>
                      )}
                    </div>

                    {item.isStacked && isExpanded && (
                      <div className={`mt-2 space-y-1 border-l-2 border-[hsl(var(--border))] ${isMobile ? "ml-3 pl-2" : "ml-4 pl-4"}`}>
                        {item.notifications.map((notification) => (
                          <Link
                            key={notification.id}
                            href={notification.action_url || "#"}
                            onClick={() => setIsOpen(false)}
                            className={`block rounded-[var(--radius)] text-sm hover:bg-[hsl(var(--muted))] dark:hover:bg-[hsl(var(--secondary))] transition-colors ${isMobile ? "px-1 py-1.5" : "px-2 py-2"}`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <span className={`text-[hsl(var(--foreground))] flex-1 ${isMobile ? "text-xs leading-tight" : ""}`}>
                                {notification.content || notification.subtitle}
                              </span>
                              <span className="text-xs text-[hsl(var(--muted-foreground))] whitespace-nowrap">
                                {formatTimeAgo(notification.created_at)}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        )}
      </DropdownContent>
    </Dropdown>
  );
}