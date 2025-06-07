// hooks/useCalendarEvents.ts (ENHANCED with Hour Logging)
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

// 🎯 NEW: Hour Logging Interface
interface HourLogData {
  report_date: string;
  hours_worked: number;
  location: string;
  activity_type: string;
  notes?: string;
}

// Quick entry pattern type (e.g., "TB 7", "JS 4.5")
interface QuickEntry {
  activityCode: string;
  hours: number;
  originalInput: string;
}

// Activity type mapping for quick entry
const ACTIVITY_CODE_MAP: Record<string, string> = {
  'TB': 'Client Coaching',
  'JS': 'Job Search Support', 
  'GS': 'Group Session',
  'AC': 'Administrative Tasks',
  'TR': 'Training',
  'MT': 'Team Meeting',
  'OT': 'Outreach',
  'AS': 'Assessment',
  'FU': 'Follow-up',
  'DC': 'Documentation'
};

// Common work hour presets
const HOUR_PRESETS = [1, 2, 4, 6, 7, 8];

// Location presets
const LOCATION_PRESETS = [
  'Main Office',
  'Community Center', 
  'Client Home',
  'Virtual/Remote',
  'Field Office',
  'Other'
];

// Activity types
const ACTIVITY_TYPES = [
  'Client Coaching',
  'Group Session',
  'Job Search Support',
  'Administrative Tasks',
  'Training',
  'Team Meeting',
  'Outreach',
  'Assessment',
  'Follow-up',
  'Documentation',
  'Other'
];

interface UseCalendarEventsProps {
  startDate: Date;
  endDate: Date;
  userId?: string;
  userRole?: string;
  coachName?: string; // 🎯 NEW: For hour logging
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
  
  // 🎯 NEW: Hour logging state
  const [loggingHours, setLoggingHours] = useState(false);

  // Format date for SQL query
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // 🎯 NEW: Parse quick entry input (e.g., "TB 7", "JS 4.5")
  const parseQuickEntry = (input: string): QuickEntry | null => {
    const trimmed = input.trim().toUpperCase();
    
    // Pattern: letters followed by space and number
    const match = trimmed.match(/^([A-Z]{1,3})\s+(\d+(?:\.\d+)?)$/);
    
    if (!match) return null;
    
    const [, activityCode, hoursStr] = match;
    const hours = parseFloat(hoursStr);
    
    if (isNaN(hours) || hours <= 0 || hours > 24) return null;
    
    return {
      activityCode,
      hours,
      originalInput: input
    };
  };

  // 🎯 NEW: Validate hour log data
  const validateHourLogData = (data: Partial<HourLogData>): string[] => {
    const errors: string[] = [];
    
    if (!data.report_date) {
      errors.push('Date is required');
    }
    
    if (!data.hours_worked || data.hours_worked <= 0) {
      errors.push('Hours must be greater than 0');
    } else if (data.hours_worked > 24) {
      errors.push('Hours cannot exceed 24 per day');
    }
    
    if (!data.activity_type) {
      errors.push('Activity type is required');
    }
    
    if (!data.location) {
      errors.push('Location is required');
    }
    
    return errors;
  };

  // Simple fetch function
  const fetchEvents = async () => {
    try {
      console.log('[Calendar] Starting fetch...');
      setLoading(true);
      setError(null);

      // Check if event_types table exists first
      const { error: typeError } = await supabase
        .from('event_types')
        .select('id')
        .limit(1);

      if (typeError && typeError.message.includes('relation')) {
        console.log('[Calendar] Tables do not exist yet - showing empty calendar');
        setEvents([]);
        setLoading(false);
        setHasLoaded(true);
        return;
      }

      // Tables exist, try to fetch events
      const { data, error: fetchError } = await supabase
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
          duration_minutes,
          event_types(name, color_code)
        `)
        .gte('event_date', formatDate(startDate))
        .lte('event_date', formatDate(endDate))
        .order('event_date', { ascending: true });

      if (fetchError) {
        console.log('[Calendar] Fetch error:', fetchError.message);
        if (fetchError.message.includes('relation')) {
          setEvents([]);
        } else {
          setError(fetchError.message);
          setEvents([]);
        }
      } else {
        const transformedEvents: CalendarEvent[] = (data || []).map((event: any) => ({
          id: event.id,
          title: event.title,
          description: event.description,
          event_date: event.event_date,
          start_time: event.start_time,
          end_time: event.end_time,
          event_type: event.event_types?.name || 'Event',
          client_name: undefined,
          coach_name: undefined,
          color_code: event.event_types?.color_code || '#3B82F6',
          status: event.status || 'scheduled',
          location: event.location,
          is_virtual: event.is_virtual || false,
          virtual_meeting_link: event.virtual_meeting_link,
          duration_minutes: event.duration_minutes || 60
        }));

        setEvents(transformedEvents);
        console.log(`[Calendar] ✅ Loaded ${transformedEvents.length} events`);
      }

    } catch (err) {
      console.error('[Calendar] Error:', err);
      setEvents([]);
      setError(null);
    } finally {
      setLoading(false);
      setHasLoaded(true);
      console.log('[Calendar] Fetch completed');
    }
  };

  // Fetch when dependencies change
  useEffect(() => {
    console.log('[Calendar] Dependencies changed, fetching...');
    fetchEvents();
  }, [startDate.getTime(), endDate.getTime(), userId, userRole]);

  // Create event function
  const createEvent = async (eventData: CreateEventData) => {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert([{
          ...eventData,
          created_by: userId
        }])
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

  // 🎯 NEW: Log hours function
  const logHours = async (hourData: HourLogData) => {
    try {
      setLoggingHours(true);
      console.log('[Calendar] Logging hours:', hourData);

      // Validate data
      const validationErrors = validateHourLogData(hourData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

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
      
      // Optionally refresh events to show any changes
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

  // 🎯 NEW: Process quick entry and return suggested form data
  const processQuickEntry = (input: string): Partial<HourLogData> | null => {
    const parsed = parseQuickEntry(input);
    if (!parsed) return null;

    const activityType = ACTIVITY_CODE_MAP[parsed.activityCode];
    if (!activityType) return null;

    return {
      hours_worked: parsed.hours,
      activity_type: activityType,
      notes: `${parsed.activityCode} - ${parsed.hours} hours worked`,
      location: 'Main Office' // Default location
    };
  };

  // 🎯 NEW: Get existing hours for a specific date
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
    // Existing functionality
    events: events || [],
    loading,
    error,
    hasLoaded,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventsForDate,
    refetch: fetchEvents,
    
    // 🎯 NEW: Hour logging functionality
    logHours,
    loggingHours,
    parseQuickEntry,
    processQuickEntry,
    validateHourLogData,
    getLoggedHoursForDate,
    
    // 🎯 NEW: Constants for UI components
    ACTIVITY_TYPES,
    LOCATION_PRESETS,
    HOUR_PRESETS,
    ACTIVITY_CODE_MAP,
    
    // 🎯 NEW: Helper functions
    formatDate,
    coachName
  };
}