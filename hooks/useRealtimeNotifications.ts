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
    // Create Supabase client
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Function to fetch initial notifications
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/notifications");
        
        // If backend is disabled, do nothing
        if (res.status === 503 || !res.ok) {
          setLoading(false);
          return;
        }
        
        const { notifications } = await res.json();
        setNotifications(notifications || []);
        setNewNotificationCount(notifications?.length || 0);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setLoading(false);
      }
    };
    
    // Fetch initial notifications
    fetchNotifications();
    
    // Set up subscription for real-time updates
    const subscription = supabase
      .channel('public:notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `or(receiver_id.eq.${supabase.auth.getUser()?.data?.user?.id || 'null'},role_admin.eq.true)`,
      }, (payload) => {
        // Add new notification to state
        setNotifications(prev => [payload.new as NotificationItem, ...prev]);
        setNewNotificationCount(prev => prev + 1);
      })
      .subscribe();
    
    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Simple function to mark notifications as read in UI only
  const markAsRead = () => {
    setNewNotificationCount(0);
  };
  
  // Function to mark notifications as read in both UI and database
  const markNotificationsAsRead = async (ids: string[]) => {
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: ids }),
        credentials: 'include'
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
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
    loading 
  };
}