// hooks/useCalendarEvents.ts (FIXED - correct API endpoints)
import { useState, useCallback, useEffect, useRef } from 'react';
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
  work_location_id?: string;
  location?: string;
  activity_type?: string;
  notes?: string;
  initials?: string;
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
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loggingHours, setLoggingHours] = useState(false);
  
  // Prevent infinite loops with refs to track fetch state
  const fetchingRef = useRef(false);
  const lastFetchKey = useRef<string>('');

  console.log('[Calendar] Hook initialized with enabled:', !!userId, 'userId:', userId);

  // Format date for SQL query
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Generate a unique key for this fetch request
  const getFetchKey = useCallback(() => {
    return `${userId}-${userRole}-${formatDate(startDate)}-${formatDate(endDate)}`;
  }, [userId, userRole, startDate, endDate]);

  // Fetch logged hours for coaches AND admins
  const fetchLoggedHours = useCallback(async (): Promise<CalendarEvent[]> => {
    // Fetch hour logs for both coaches and admins
    if (!userId || (userRole !== 'coachx7' && userRole !== 'admin1')) {
      return [];
    }

    try {
      console.log('[Calendar] Fetching logged hours for role:', userRole, 'userId:', userId);
      
      const startDateStr = formatDate(startDate);
      const endDateStr = formatDate(endDate);
      
      // For coaches, get only their own hour logs
      // For admins, get all hour logs (no coach_id filter)
      let apiUrl = `/api/calendar/logged-hours-range?start_date=${startDateStr}&end_date=${endDateStr}`;
      
      if (userRole === 'coachx7') {
        // Coaches see only their own hour logs
        apiUrl += `&coach_id=${userId}`;
      }
      // Admins see ALL hour logs (no coach_id filter)
      
      const response = await fetch(apiUrl, {
        credentials: 'include'
      });

      if (!response.ok) {
        console.warn('[Calendar] Could not fetch logged hours:', response.status);
        return [];
      }

      const loggedHours = await response.json();
      console.log('[Calendar] Found logged hours:', loggedHours.length, 'entries');

      // Convert logged hours to calendar events
      const hourEvents: CalendarEvent[] = loggedHours.map((hour: any) => {
        // Get location name (either from work_locations join or custom location)
        const locationName = hour.work_locations?.location_name || hour.location || 'Unknown location';
        const locationDetails = hour.work_locations?.city ? 
          `${locationName}, ${hour.work_locations.city}` : locationName;
        
        // Get coach name from the hour log data or fallback
        const hourCoachName = hour.coach_name || hour.profiles?.display_name || coachName || 'Unknown Coach';
        
        return {
          id: `hour-log-${hour.id}`,
          title: `${hour.initials || 'Coach'} ${hour.hours_worked || 0}h`, // Ensure no NaN and add 'h' for hours
          description: `${hour.hours_worked || 0} hours - ${hour.activity_type || 'Work'} at ${locationDetails}${hour.notes ? '\n\nNotes: ' + hour.notes : ''}`,
          event_date: hour.report_date,
          start_time: 'All Day', // Special indicator for hour logs
          end_time: 'All Day', // Special indicator for hour logs
          event_type: 'Hour Log',
          coach_name: hourCoachName,
          client_name: '',
          color_code: '#10B981', // Green for hour logs
          status: 'completed',
          location: locationDetails,
          is_virtual: false,
          virtual_meeting_link: '',
          duration_minutes: (hour.hours_worked || 0) * 60,
          is_hour_log: true
        };
      });

      return hourEvents;
    } catch (error) {
      console.error('[Calendar] Error fetching logged hours:', error);
      return [];
    }
  }, [userId, userRole, startDate, endDate, coachName]);

  // Fetch regular calendar events from calendar_events table
  const fetchCalendarEvents = useCallback(async (): Promise<CalendarEvent[]> => {
    if (!userId) return [];
    
    try {
      console.log('[Calendar] Fetching calendar events for:', userRole, userId);
      
      const startDateStr = formatDate(startDate);
      const endDateStr = formatDate(endDate);
      
      // Build API URL for calendar events (NOT hour logs)
      const apiUrl = `/api/calendar/events?start_date=${startDateStr}&end_date=${endDateStr}&user_id=${userId}&user_role=${userRole}`;
      
      const response = await fetch(apiUrl, {
        credentials: 'include'
      });

      if (!response.ok) {
        console.warn('[Calendar] Could not fetch calendar events:', response.status);
        return [];
      }

      const calendarEvents = await response.json();
      console.log('[Calendar] Found calendar events:', calendarEvents.length, 'entries');

      return calendarEvents;
      
    } catch (error) {
      console.error('[Calendar] Error fetching calendar events:', error);
      return [];
    }
  }, [userId, userRole, startDate, endDate]);

  // Main fetch function with loop prevention
  const fetchEvents = useCallback(async () => {
    const currentFetchKey = getFetchKey();
    
    // Prevent multiple simultaneous fetches and redundant fetches
    if (fetchingRef.current || lastFetchKey.current === currentFetchKey) {
      console.log('[Calendar] Skipping fetch - already fetching or same parameters');
      return;
    }

    // Don't fetch if we don't have the required data
    if (!userId) {
      console.log('[Calendar] No userId, skipping fetch');
      return;
    }

    fetchingRef.current = true;
    lastFetchKey.current = currentFetchKey;
    setLoading(true);
    setError(null);

    try {
      console.log('[Calendar] Starting fetch for:', currentFetchKey);
      
      // Fetch hour logs for coaches AND admins
      const hourLogEvents = await fetchLoggedHours();
      
      // Fetch regular calendar events
      const calendarEvents = await fetchCalendarEvents();
      
      // Combine all events
      const allEvents: CalendarEvent[] = [...hourLogEvents, ...calendarEvents];

      console.log('[Calendar] Found calendar events:', calendarEvents.length, 'entries');
      console.log('[Calendar] Setting events:', allEvents.length, 'total events');
      setEvents(allEvents);
      setHasLoaded(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch events';
      console.error('[Calendar] Fetch error:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [userId, fetchLoggedHours, fetchCalendarEvents, getFetchKey]);

  // Auto-fetch only when key parameters change (COMPLETELY SIMPLIFIED)
  useEffect(() => {
    if (!userId) {
      return;
    }

    const currentKey = getFetchKey();
    
    // Only fetch if the key actually changed and we're not fetching
    if (currentKey !== lastFetchKey.current && !fetchingRef.current) {
      fetchEvents();
    }
  }, [userId, userRole, formatDate(startDate), formatDate(endDate)]); // Use formatted dates to prevent object comparison issues

  // Manual refetch function (for after logging hours)
  const refetch = useCallback(async () => {
    // Reset the last fetch key to force a fresh fetch
    lastFetchKey.current = '';
    await fetchEvents();
  }, [fetchEvents]);

  // Log hours function (only for coaches)
  const logHours = async (hourData: HourLogData) => {
    // Only coaches can log hours
    if (userRole !== 'coachx7') {
      throw new Error('Only coaches can log hours');
    }

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
          coach_name: coachName,
          initials: hourData.initials || 'Coach' // Extract initials from hourData
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
      
      // Refresh events after successful logging
      setTimeout(() => {
        refetch();
      }, 100);
      
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

  // FIXED: Get logged hours for a specific date (only for coaches)
  const getLoggedHoursForDate = async (date: Date): Promise<number> => {
    if (userRole !== 'coachx7' || !userId) return 0;

    try {
      const dateStr = formatDate(date);
      // FIXED: Use the correct API endpoint that exists
      const response = await fetch(`/api/calendar/log-hours?date=${dateStr}&coach_id=${userId}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        console.warn('[Calendar] Could not fetch hours for date:', response.status);
        return 0;
      }

      const result = await response.json();
      return result.totalHours || 0;
    } catch (error) {
      console.error('[Calendar] Error fetching hours for date:', error);
      return 0;
    }
  };

  // Placeholder functions for regular events
  const createEvent = async (eventData: any) => {
    throw new Error('Event creation not implemented yet');
  };

  const updateEvent = async (eventId: string, eventData: any) => {
    throw new Error('Event update not implemented yet');
  };

  const deleteEvent = async (eventId: string) => {
    throw new Error('Event deletion not implemented yet');
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = formatDate(date);
    return events.filter(event => event.event_date === dateStr);
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
    refetch,
    formatDate,
    coachName
  };
}