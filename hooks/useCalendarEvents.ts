// hooks/useCalendarEvents.ts (MINIMAL - stops infinite loop)
import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  start_time: string;
  end_time: string;
  event_type: string;
  client_name?: string;
  coach_name?: string;
  color_code: string;
  status: string;
  location?: string;
  is_virtual: boolean;
  virtual_meeting_link?: string;
  duration_minutes: number;
  is_hour_log?: boolean;
}

interface HourLogData {
  report_date: string;
  hours_worked: number;
  location: string;
  activity_type: string;
  notes?: string;
}

interface UseCalendarEventsProps {
  startDate: Date;
  endDate: Date;
  userId?: string;
  userRole?: string;
  coachName?: string;
}

export function useCalendarEvents({
  startDate,
  endDate,
  userId,
  userRole,
  coachName
}: UseCalendarEventsProps) {
  // Static state - no automatic fetching
  const [events] = useState<CalendarEvent[]>([]);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);
  const [hasLoaded] = useState(true);
  const [loggingHours, setLoggingHours] = useState(false);

  console.log('[Calendar] Hook initialized (no auto-fetch)');

  // Format date for SQL query
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Simplified log hours function (only thing that works for now)
  const logHours = async (hourData: HourLogData) => {
    try {
      setLoggingHours(true);
      console.log('[Calendar] Logging hours:', hourData);

      // Call API to save to coach_daily_reports table
      const response = await fetch('/api/calendar/log-hours', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...hourData,
          coach_id: userId,
          coach_name: coachName
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Calendar] API Error:', response.status, errorText);
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log('[Calendar] ✅ Hours logged successfully:', result);

      toast.success(`Successfully logged ${hourData.hours_worked} hours for ${hourData.activity_type}`);
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to log hours';
      console.error('[Calendar] Hour logging error:', err);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoggingHours(false);
    }
  };

  // Disabled functions to prevent issues
  const getLoggedHoursForDate = async (date: Date): Promise<number> => {
    console.log('[Calendar] getLoggedHoursForDate disabled to prevent spam');
    return 0;
  };

  // Placeholder functions
  const createEvent = async (eventData: any) => {
    throw new Error('Event creation disabled in minimal mode');
  };

  const updateEvent = async (eventId: string, eventData: any) => {
    throw new Error('Event update disabled in minimal mode');
  };

  const deleteEvent = async (eventId: string) => {
    throw new Error('Event deletion disabled in minimal mode');
  };

  const getEventsForDate = (date: Date) => {
    return [];
  };

  const fetchEvents = () => {
    console.log('[Calendar] Manual fetch disabled to prevent infinite loops');
  };

  return {
    events: events || [],
    loading,
    error,
    hasLoaded,
    createEvent,
    updateEvent,
    deleteEvent,
    logHours,
    loggingHours,
    getLoggedHoursForDate,
    getEventsForDate,
    refetch: fetchEvents,
    formatDate,
    coachName
  };
}