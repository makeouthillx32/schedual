// hooks/useCalendarEvents.ts (ENHANCED to include hour logs)
import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { toast } from 'react-hot-toast';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
  is_hour_log?: boolean; // NEW: Flag for hour log entries
}

interface CoachHourLog {
  id: string;
  coach_profile_id: string;
  report_date: string;
  hours_worked: number;
  location: string;
  activity_type: string;
  notes: string;
  created_at: string;
}

interface CreateEventData {
  title: string;
  description?: string;
  event_date: string;
  start_time: string;
  end_time: string;
  event_type_id: string;
  client_profile_id?: string;
  coach_profile_id?: string;
  location?: string;
  is_virtual?: boolean;
  virtual_meeting_link?: string;
  priority?: string;
  reminder_minutes?: number;
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
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loggingHours, setLoggingHours] = useState(false);

  // Format date for SQL query
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Convert coach hour logs to calendar events
  const convertHourLogsToEvents = (hourLogs: CoachHourLog[]): CalendarEvent[] => {
    return hourLogs.map(log => ({
      id: `hour-log-${log.id}`,
      title: `${log.hours_worked}h - ${log.activity_type}`,
      description: log.notes || `Logged ${log.hours_worked} hours for ${log.activity_type}`,
      event_date: log.report_date,
      start_time: '09:00',
      end_time: '17:00',
      event_type: 'Hour Log',
      coach_name: coachName || 'Coach',
      client_name: '',
      color_code: '#10B981', // Green for hour logs
      status: 'completed',
      location: log.location,
      is_virtual: false,
      virtual_meeting_link: '',
      duration_minutes: Math.round(log.hours_worked * 60),
      is_hour_log: true
    }));
  };

  // Fetch calendar events and hour logs
  const fetchEvents = async () => {
    try {
      console.log('[Calendar] Fetching events and hour logs...');
      setLoading(true);
      setError(null);

      const startDateStr = formatDate(startDate);
      const endDateStr = formatDate(endDate);

      // Fetch regular calendar events
      let regularEvents: CalendarEvent[] = [];
      
      try {
        const { data: eventsData, error: eventsError } = await supabase
          .from('calendar_events')
          .select(`
            id,
            title,
            description,
            event_date,
            start_time,
            end_time,
            location,
            is_virtual,
            virtual_meeting_link,
            status,
            priority,
            client_profile:client_profile_id(id),
            coach_profile:coach_profile_id(id),
            event_type:event_type_id(id, name, color_code)
          `)
          .gte('event_date', startDateStr)
          .lte('event_date', endDateStr)
          .order('event_date', { ascending: true });

        if (eventsError) {
          console.warn('[Calendar] Events table error (might not exist):', eventsError);
        } else {
          regularEvents = (eventsData || []).map(event => ({
            id: event.id,
            title: event.title,
            description: event.description || '',
            event_date: event.event_date,
            start_time: event.start_time,
            end_time: event.end_time,
            event_type: event.event_type?.name || 'Event',
            client_name: event.client_profile?.id || '',
            coach_name: event.coach_profile?.id || '',
            color_code: event.event_type?.color_code || '#3B82F6',
            status: event.status,
            location: event.location || '',
            is_virtual: event.is_virtual || false,
            virtual_meeting_link: event.virtual_meeting_link || '',
            duration_minutes: 60,
            is_hour_log: false
          }));
        }
      } catch (err) {
        console.warn('[Calendar] Regular events fetch failed:', err);
      }

      // Fetch coach hour logs
      let hourLogEvents: CalendarEvent[] = [];
      
      try {
        const { data: hourLogsData, error: hourLogsError } = await supabase
          .from('coach_daily_reports')
          .select('*')
          .gte('report_date', startDateStr)
          .lte('report_date', endDateStr)
          .order('report_date', { ascending: true });

        if (hourLogsError) {
          console.warn('[Calendar] Hour logs fetch error:', hourLogsError);
        } else {
          hourLogEvents = convertHourLogsToEvents(hourLogsData || []);
          console.log('[Calendar] ✅ Fetched hour logs:', hourLogsData?.length);
        }
      } catch (err) {
        console.warn('[Calendar] Hour logs fetch failed:', err);
      }

      // Combine all events
      const allEvents = [...regularEvents, ...hourLogEvents];
      setEvents(allEvents);
      setHasLoaded(true);

      console.log('[Calendar] ✅ Total events loaded:', allEvents.length, {
        regular: regularEvents.length,
        hourLogs: hourLogEvents.length
      });

    } catch (err) {
      console.error('[Calendar] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load calendar');
    } finally {
      setLoading(false);
    }
  };

  // Load events when date range changes
  useEffect(() => {
    if (startDate && endDate) {
      fetchEvents();
    }
  }, [startDate, endDate, userId, userRole]);

  // Create event function
  const createEvent = async (eventData: CreateEventData) => {
    try {
      // Get a default event type if none provided
      let eventTypeId = eventData.event_type_id;
      
      if (!eventTypeId) {
        const { data: defaultType } = await supabase
          .from('event_types')
          .select('id')
          .limit(1)
          .single();
        
        eventTypeId = defaultType?.id || null;
      }

      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          ...eventData,
          event_type_id: eventTypeId,
          created_by: userId
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast.success('Event created successfully');
      await fetchEvents();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create event';
      toast.error(errorMessage);
      throw err;
    }
  };

  // Update event function
  const updateEvent = async (eventId: string, eventData: Partial<CreateEventData>) => {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .update(eventData)
        .eq('id', eventId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast.success('Event updated successfully');
      await fetchEvents();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update event';
      toast.error(errorMessage);
      throw err;
    }
  };

  // Delete event function
  const deleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId);

      if (error) {
        throw error;
      }

      toast.success('Event deleted successfully');
      await fetchEvents();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete event';
      toast.error(errorMessage);
      throw err;
    }
  };

  // Log hours function
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
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log('[Calendar] ✅ Hours logged successfully:', result);

      toast.success(`Successfully logged ${hourData.hours_worked} hours for ${hourData.activity_type}`);
      
      // Refresh events to show the new hour log
      await fetchEvents();
      
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

  // Get existing hours for a specific date
  const getLoggedHoursForDate = async (date: Date): Promise<number> => {
    try {
      const dateString = formatDate(date);
      
      const response = await fetch(`/api/calendar/logged-hours?date=${dateString}&coach_id=${userId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        return data.totalHours || 0;
      }
      
      return 0;
    } catch (err) {
      console.error('[Calendar] Error fetching logged hours:', err);
      return 0;
    }
  };

  // Get events for specific date
  const getEventsForDate = (date: Date) => {
    const dateString = formatDate(date);
    return events.filter(event => event.event_date === dateString);
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