// hooks/useRealtimeNotifications.ts
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

interface NotificationItem {
  id: string;
  image_url: string;
  title: string;
  subtitle: string;
  action_url: string;
  created_at: string;
  read?: boolean;
}

export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [newNotificationCount, setNewNotificationCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    let subscription: any;

    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const userId = user.id;

      try {
        setLoading(true);
        const res = await fetch('/api/notifications');
        if (!res.ok || res.status === 503) {
          setLoading(false);
        } else {
          const { notifications } = await res.json();
          setNotifications(notifications || []);
          setNewNotificationCount(notifications?.length || 0);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        setLoading(false);
      }

      subscription = supabase
        .channel('public:notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `or(receiver_id.eq.${userId},role_admin.eq.true,role_jobcoach.eq.true,role_client.eq.true,role_user.eq.true)`,
          },
          ({ new: n }) => {
            const note = n as NotificationItem;
            setNotifications((prev) => [note, ...prev]);
            setNewNotificationCount((prev) => prev + 1);
          }
        )
        .subscribe();
    };

    init();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const markAsRead = () => {
    setNewNotificationCount(0);
  };

  const markNotificationsAsRead = async (ids: string[]) => {
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: ids }),
        credentials: 'include',
      });
      setNotifications((prev) =>
        prev.map((notification) =>
          ids.includes(notification.id)
            ? { ...notification, read: true }
            : notification
        )
      );
      setNewNotificationCount(0);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  return {
    notifications,
    newNotificationCount,
    markAsRead,
    markNotificationsAsRead,
    loading,
  };
}