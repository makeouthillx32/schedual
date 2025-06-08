// app/dashboard/[id]/calendar/page.tsx (REFACTORED - Clean & Modular with Optimistic Updates)
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import CalendarBox from '@/components/CalenderBox';
import EventModal from './_components/EventModal';
import CoachHoursModal from './_components/CoachHoursModal';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useAuth } from '@/app/provider';

// Interfaces
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
  is_hour_log?: boolean;
}

interface CoachHoursData {
  report_date: string;
  hours_worked: number;
  location?: string;
  activity_type?: string;
  notes?: string;
}

interface OptimisticUpdate {
  id: string;
  date: string;
  hours: number;
  activity: string;
  location: string;
  notes: string;
  coachName: string;
  timestamp: number;
}

export default function CalendarPage() {
  const { user } = useAuth();
  
  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isHoursModalOpen, setIsHoursModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [userRole, setUserRole] = useState<string>('user0x');
  const [roleLoading, setRoleLoading] = useState(true);
  const [existingHoursForDate, setExistingHoursForDate] = useState<number>(0);
  
  // NEW: Optimistic updates for hour logging
  const [optimisticHours, setOptimisticHours] = useState<OptimisticUpdate[]>([]);

  // Fetch user role from profiles table
  useEffect(() => {
    async function fetchUserRole() {
      if (!user?.id) {
        setRoleLoading(false);
        return;
      }

      try {        
        const response = await fetch(`/api/profile/${user.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        
        const profileData = await response.json();
        const roleFromDb = profileData.role;        
        setUserRole(roleFromDb);
        
      } catch (error) {
        console.error('Error fetching user role:', error);
        const fallbackRole = user?.user_metadata?.role || user?.app_metadata?.role || 'user0x';        
        setUserRole(fallbackRole);
      } finally {
        setRoleLoading(false);
      }
    }

    fetchUserRole();
  }, [user?.id]);
  
  // Static permissions based on role
  const permissions = useMemo(() => {    
    switch (userRole) {
      case 'admin1':
        return {
          canCreateEvents: true,
          canEditEvents: true,
          canDeleteEvents: true,
          canLogHours: true,
          canViewAllEvents: true,
          canManageUsers: true
        };
      case 'coachx7':
        return {
          canCreateEvents: false,
          canEditEvents: false,
          canDeleteEvents: false,
          canLogHours: true,
          canViewAllEvents: false,
          canManageUsers: false
        };
      case 'client7x':
        return {
          canCreateEvents: false,
          canEditEvents: false,
          canDeleteEvents: false,
          canLogHours: false,
          canViewAllEvents: false,
          canManageUsers: false
        };
      default:
        return {
          canCreateEvents: false,
          canEditEvents: false,
          canDeleteEvents: false,
          canLogHours: false,
          canViewAllEvents: false,
          canManageUsers: false
        };
    }
  }, [userRole]);

  // Get events for current month
  const { 
    events, 
    loading, 
    error, 
    hasLoaded,
    createEvent, 
    updateEvent, 
    deleteEvent,
    logHours,
    loggingHours,
    getLoggedHoursForDate
  } = useCalendarEvents({
    startDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
    endDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0),
    userId: user?.id,
    userRole: userRole,
    coachName: user?.user_metadata?.display_name || user?.email || 'Unknown Coach'
  });

  // NEW: Convert optimistic hours to calendar events
  const convertOptimisticToEvents = (optimistic: OptimisticUpdate[]): CalendarEvent[] => {
    return optimistic.map(entry => ({
      id: `hour-log-${entry.id}`,
      title: `${entry.hours}h - ${entry.activity}`,
      description: entry.notes || `Logged ${entry.hours} hours at ${entry.location}`,
      event_date: entry.date,
      start_time: '09:00',
      end_time: '17:00',
      event_type: 'Hour Log',
      coach_name: entry.coachName,
      client_name: '',
      color_code: '#10B981', // Green for hour logs
      status: 'completed',
      is_hour_log: true
    }));
  };

  // Fetch existing hours when date is selected
  useEffect(() => {
    if (selectedDate && permissions.canLogHours && getLoggedHoursForDate) {
      getLoggedHoursForDate(selectedDate).then(hours => {
        setExistingHoursForDate(hours || 0);
      }).catch(() => {
        setExistingHoursForDate(0);
      });
    }
  }, [selectedDate, permissions.canLogHours, getLoggedHoursForDate]);

  // NEW: Clear optimistic entries when real data loads
  useEffect(() => {
    if (hasLoaded && events) {
      setOptimisticHours(prev => {
        return prev.filter(optimistic => {
          // Check if this date already has a real hour log event
          const realEvent = events.find(event => 
            event.event_date === optimistic.date && 
            event.title?.includes(`${optimistic.hours}h`) &&
            event.is_hour_log
          );
          return !realEvent; // Keep only if no real event found
        });
      });
    }
  }, [hasLoaded, events]);

  // Filter and combine events based on role
  const displayEvents = useMemo(() => {
    let baseEvents = events || [];
    
    // Filter regular events based on role
    switch (userRole) {
      case 'admin1':
        // Admins see all events        
        break;
      
      case 'coachx7':
        // Job coaches see events for their assigned clients + their own entries
        baseEvents = baseEvents.filter(event => 
          event.coach_name === user?.email ||
          event.coach_name?.includes(user?.user_metadata?.display_name) ||
          event.coach_name?.includes(user?.user_metadata?.name)
        );        
        break;
      
      case 'client7x':
        // Clients see their own events + coach hour logs (for transparency)
        baseEvents = baseEvents.filter(event => 
          event.client_name === user?.email ||
          event.client_name?.includes(user?.user_metadata?.display_name) ||
          event.client_name?.includes(user?.user_metadata?.name) ||
          event.is_hour_log // NEW: Clients can see coach hour logs
        );        
        break;
      
      default:
        // Basic users see no calendar events        
        baseEvents = [];
        break;
    }

    // NEW: Add optimistic hour log events for coaches and clients
    if ((userRole === 'coachx7' || userRole === 'client7x') && optimisticHours.length > 0) {
      const optimisticEvents = convertOptimisticToEvents(optimisticHours);
      baseEvents = [...baseEvents, ...optimisticEvents];
    }

    return baseEvents;
  }, [events, userRole, user, optimisticHours]);

  // Navigation handlers
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Event handlers
  const handleDateClick = (date: Date) => {
    if (permissions.canLogHours && userRole === 'coachx7') {
      // For coaches, clicking a date opens hours modal
      setSelectedDate(date);
      setIsHoursModalOpen(true);
      return;
    }
    
    if (permissions.canCreateEvents) {
      // For admins, clicking a date opens event modal
      setSelectedDate(date);
      setSelectedEvent(null);
      setIsEventModalOpen(true);
      return;
    }
    
    console.log('User does not have permission to create events or log hours');
  };

  const handleEventClick = (event: CalendarEvent) => {
    // NEW: Handle hour log event clicks differently
    if (event.is_hour_log && permissions.canLogHours) {
      // For hour logs, open the hours modal for that date to view/edit
      setSelectedDate(new Date(event.event_date));
      setIsHoursModalOpen(true);
      return;
    }

    // Regular event handling
    setSelectedEvent(event);
    setSelectedDate(new Date(event.event_date));
    setIsEventModalOpen(true);
  };

  // Event CRUD handlers
  const handleCreateEvent = async (eventData: any) => {
    if (!permissions.canCreateEvents) {
      console.error('User does not have permission to create events');
      return;
    }

    try {
      await createEvent(eventData);
      setIsEventModalOpen(false);
      setSelectedEvent(null);
      setSelectedDate(null);
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  const handleUpdateEvent = async (eventData: any) => {
    if (!selectedEvent || !permissions.canEditEvents) {
      console.error('User does not have permission to edit events');
      return;
    }
    
    try {
      await updateEvent(selectedEvent.id, eventData);
      setIsEventModalOpen(false);
      setSelectedEvent(null);
      setSelectedDate(null);
    } catch (error) {
      console.error('Failed to update event:', error);
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent || !permissions.canDeleteEvents) {
      console.error('User does not have permission to delete events');
      return;
    }
    
    try {
      await deleteEvent(selectedEvent.id);
      setIsEventModalOpen(false);
      setSelectedEvent(null);
      setSelectedDate(null);
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  // NEW: Enhanced hours submission with optimistic updates
  const handleHoursSubmit = async (hoursData: CoachHoursData, optimisticData: OptimisticUpdate) => {
    if (!permissions.canLogHours) {
      console.error('User does not have permission to log hours');
      return;
    }

    try {
      // Add optimistic entry immediately
      setOptimisticHours(prev => {
        // Remove any existing entry for this date, then add new one
        const filtered = prev.filter(entry => entry.date !== optimisticData.date);
        return [...filtered, optimisticData];
      });

      // Close modal immediately for better UX
      setIsHoursModalOpen(false);
      setSelectedDate(null);

      // Save to database in background
      if (logHours) {
        await logHours(hoursData);
        // On successful save, optimistic entry will be replaced by real data on next reload
      } else {
        // Temporary mock implementation
        await new Promise(resolve => setTimeout(resolve, 1000));        
      }
      
    } catch (error) {
      // On error, remove the optimistic entry
      setOptimisticHours(prev => 
        prev.filter(entry => entry.id !== optimisticData.id)
      );
      
      // Reopen modal to show error
      setIsHoursModalOpen(true);
      console.error('Failed to log hours:', error);
      throw error; // Let modal handle the error display
    }
  };

  // Helper functions
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin1': return 'Administrator';
      case 'coachx7': return 'Job Coach';
      case 'client7x': return 'Client';
      case 'user0x': return 'Basic User';
      default: return 'User';
    }
  };

  // Loading and error states
  const showLoading = (loading && !hasLoaded) || roleLoading;

  if (!user) {
    return (
      <>
        <Breadcrumb pageName="Calendar" />
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Please sign in to view your calendar.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Breadcrumb pageName="Calendar" />
      
      <div className="mx-auto max-w-7xl">
        {/* Calendar Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
                {formatMonthYear(currentDate)}
              </h1>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                {getRoleDisplayName(userRole)} View
                {roleLoading && ' (Loading role...)'}
                {/* NEW: Show optimistic entries count */}
                {optimisticHours.length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {optimisticHours.length} pending
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-colors"
                aria-label="Previous month"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => navigateMonth('next')}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-colors"
                aria-label="Next month"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={goToToday}
              className="px-4 py-2 text-sm font-medium text-[hsl(var(--foreground))] bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary))]/80 rounded-md transition-colors"
            >
              Today
            </button>
            
            <div className="flex items-center rounded-md border border-[hsl(var(--border))]">
              {(['month', 'week', 'day'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 text-sm font-medium capitalize transition-colors first:rounded-l-md last:rounded-r-md ${
                    viewMode === mode
                      ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                      : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Role-based action buttons */}
            <div className="flex items-center gap-2">
              {permissions.canLogHours && (
                <button
                  onClick={() => {
                    setSelectedDate(new Date());
                    setIsHoursModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[hsl(var(--secondary-foreground))] bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary))]/80 rounded-md transition-colors"
                  title="Log your work hours (supports quick entry like 'TB 7')"
                  disabled={loggingHours}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12,6 12,12 16,14"></polyline>
                  </svg>
                  {loggingHours ? 'Logging...' : 'Log Hours'}
                </button>
              )}

              {permissions.canCreateEvents && (
                <button
                  onClick={() => {
                    setSelectedDate(new Date());
                    setSelectedEvent(null);
                    setIsEventModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 rounded-md transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  New Event
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Role-based info panel */}
        <div className="mb-4 p-4 bg-[hsl(var(--muted))] rounded-lg border border-[hsl(var(--border))]">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span className="text-sm font-medium">
              Viewing as: {getRoleDisplayName(userRole)}
            </span>
          </div>
          <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
            {userRole === 'admin1' && 'You can create, edit and delete all calendar events. Click dates to create events.'}
            {userRole === 'coachx7' && 'Click any date to log your work hours (try "TB 7" for quick entry). Your logged hours appear as green calendar events.'}
            {userRole === 'client7x' && 'You can view your scheduled appointments and meetings. Coach hour logs appear for transparency.'}
            {userRole === 'user0x' && 'Basic user - limited calendar access.'}
            {!['admin1', 'coachx7', 'client7x', 'user0x'].includes(userRole) && 'Unknown role - no calendar access.'}
          </div>
        </div>

        {/* Calendar Content */}
        {showLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 animate-spin" />
              <span className="text-muted-foreground">
                {roleLoading ? 'Loading role...' : 'Loading calendar...'}
              </span>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-destructive mb-4">Failed to load calendar</p>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <CalendarBox
                currentDate={currentDate}
                events={[]}
                onDateClick={handleDateClick}
                onEventClick={handleEventClick}
                viewMode={viewMode}
              />
            </div>
          </div>
        ) : (
          <CalendarBox
            currentDate={currentDate}
            events={displayEvents}
            onDateClick={handleDateClick}
            onEventClick={handleEventClick}
            viewMode={viewMode}
          />
        )}

        {/* Event Modal - only show for users with event permissions */}
        {(permissions.canCreateEvents || permissions.canEditEvents) && (
          <EventModal
            isOpen={isEventModalOpen}
            onClose={() => {
              setIsEventModalOpen(false);
              setSelectedEvent(null);
              setSelectedDate(null);
            }}
            onSubmit={selectedEvent ? handleUpdateEvent : handleCreateEvent}
            onDelete={selectedEvent && permissions.canDeleteEvents ? handleDeleteEvent : undefined}
            selectedDate={selectedDate}
            selectedEvent={selectedEvent}
          />
        )}

        {/* Coach Hours Modal - only show for coaches */}
        {permissions.canLogHours && (
          <CoachHoursModal
            isOpen={isHoursModalOpen}
            onClose={() => {
              setIsHoursModalOpen(false);
              setSelectedDate(null);
            }}
            onSubmit={handleHoursSubmit}
            selectedDate={selectedDate}
            coachName={user?.user_metadata?.display_name || user?.email || 'Unknown Coach'}
            existingHours={existingHoursForDate}
          />
        )}
      </div>
    </>
  );
}