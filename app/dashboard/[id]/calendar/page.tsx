// app/dashboard/[id]/calendar/page.tsx (RBAC Enhanced)
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, Users } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import CalendarBox from '@/components/CalenderBox';
import EventModal from './_components/EventModal';
import CoachHoursModal from './_components/CoachHoursModal';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useAuth } from '@/app/provider';
import useHallMonitor from '@/hooks/useHallMonitor';

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
}

// Remove the old role permissions - now using HallMonitor RBAC

export default function CalendarPage() {
  const { user } = useAuth();
  
  // Use HallMonitor for RBAC
  const { 
    user: hallUser, 
    monitor, 
    contentConfig, 
    isLoading: hallLoading, 
    error: hallError,
    canAccess,
    hasFeature 
  } = useHallMonitor(user?.id);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isHoursModalOpen, setIsHoursModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  // Role-based permissions from HallMonitor
  const userRole = hallUser?.role_name || 'user';
  const userRoleId = hallUser?.role_id;
  
  // Calendar-specific permissions
  const [permissions, setPermissions] = useState({
    canCreateEvents: false,
    canEditEvents: false,
    canDeleteEvents: false,
    canLogHours: false,
    canViewAllEvents: false,
    canManageUsers: false
  });

  // Update permissions when hall monitor loads
  useEffect(() => {
    const updatePermissions = async () => {
      if (!monitor || !hallUser) return;
      
      const newPermissions = {
        canCreateEvents: await canAccess('calendar_events', 'create'),
        canEditEvents: await canAccess('calendar_events', 'update'),
        canDeleteEvents: await canAccess('calendar_events', 'delete'),
        canLogHours: await canAccess('coach_daily_reports', 'create'),
        canViewAllEvents: await canAccess('calendar_events', 'read', { scope: 'all' }),
        canManageUsers: await canAccess('users', 'read')
      };
      
      setPermissions(newPermissions);
      console.log('[Calendar] Updated permissions for role:', userRole, newPermissions);
    };

    updatePermissions();
  }, [monitor, hallUser, canAccess, userRole]);

  // Get events for current month with role-based filtering
  const { 
    events, 
    loading, 
    error, 
    hasLoaded,
    createEvent, 
    updateEvent, 
    deleteEvent 
  } = useCalendarEvents({
    startDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
    endDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0),
    userId: user?.id,
    userRole: userRoleId // Use the actual role ID from database
  });

  // Filter events based on user role and permissions
  const filteredEvents = useMemo(() => {
    if (!events || events.length === 0) return [];
    
    switch (userRole) {
      case 'admin':
        // Admins see all events
        return events;
      
      case 'jobcoach':
        // Job coaches see events for their assigned clients + their own entries
        return events.filter(event => 
          event.coach_name === hallUser?.email ||
          event.coach_name === user?.email // Fallback
        );
      
      case 'client':
        // Clients see only their own events
        return events.filter(event => 
          event.client_name === hallUser?.email ||
          event.client_name === user?.email // Fallback
        );
      
      default:
        // Basic users see no calendar events
        return [];
    }
  }, [events, userRole, hallUser, user]);

  // Navigation functions
  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  }, []);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  // Event handlers with RBAC checks
  const handleDateClick = useCallback((date: Date) => {
    if (!permissions.canCreateEvents && !permissions.canLogHours) {
      return; // Prevent action for users without permissions
    }
    
    setSelectedDate(date);
    setSelectedEvent(null);
    
    // For job coaches, show hours logging modal by default
    if (userRole === 'jobcoach') {
      setIsHoursModalOpen(true);
    } else if (permissions.canCreateEvents) {
      setIsEventModalOpen(true);
    }
  }, [permissions, userRole]);

  const handleEventClick = useCallback((event: CalendarEvent) => {
    // All users can view event details, but editing depends on permissions
    setSelectedEvent(event);
    setSelectedDate(new Date(event.event_date));
    setIsEventModalOpen(true);
  }, []);

  const handleCreateEvent = useCallback(async (eventData: any) => {
    if (!permissions.canCreateEvents) {
      console.warn('User does not have permission to create events');
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
  }, [createEvent, permissions]);

  const handleUpdateEvent = useCallback(async (eventData: any) => {
    if (!selectedEvent || !permissions.canEditEvents) {
      console.warn('User does not have permission to edit events');
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
  }, [selectedEvent, updateEvent, permissions]);

  const handleDeleteEvent = useCallback(async () => {
    if (!selectedEvent || !permissions.canDeleteEvents) {
      console.warn('User does not have permission to delete events');
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
  }, [selectedEvent, deleteEvent, permissions]);

  // Coach hours logging
  const handleLogHours = useCallback(async (hoursData: any) => {
    if (!permissions.canLogHours) {
      console.warn('User does not have permission to log hours');
      return;
    }
    
    try {
      // Call API to log coach hours
      const response = await fetch('/api/calendar/log-hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...hoursData,
          coach_profile_id: user?.id,
          created_by: user?.id
        })
      });
      
      if (!response.ok) throw new Error('Failed to log hours');
      
      setIsHoursModalOpen(false);
      setSelectedDate(null);
      
      // Refresh events to show updated data
      // This would trigger a re-fetch in your useCalendarEvents hook
    } catch (error) {
      console.error('Failed to log hours:', error);
    }
  }, [permissions, user]);

  // Format month/year for display
  const formatMonthYear = useCallback((date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  }, []);

  // Show loading state for both calendar and hall monitor
  const showLoading = (loading && !hasLoaded) || hallLoading;

  // Combined error state
  const combinedError = error || hallError;

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

  // Show loading while hall monitor is initializing
  if (hallLoading && !hallUser) {
    return (
      <>
        <Breadcrumb pageName="Calendar" />
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 animate-spin" />
              <span className="text-muted-foreground">Loading permissions...</span>
            </div>
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
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)} View
                {hallUser?.specializations?.length ? ` • ${hallUser.specializations.map(s => s.name).join(', ')}` : ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigateMonth('next')}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
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
                    setSelectedEvent(null);
                    setIsHoursModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[hsl(var(--secondary-foreground))] bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary))]/80 rounded-md transition-colors"
                  title="Log your work hours"
                >
                  <Clock className="h-4 w-4" />
                  Log Hours
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
                  <Plus className="h-4 w-4" />
                  New Event
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Role-based info banner */}
        {userRole === 'client' && (
          <div className="mb-4 p-4 bg-[hsl(var(--muted))] rounded-lg border border-[hsl(var(--border))]">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              <span className="text-sm text-[hsl(var(--muted-foreground))]">
                You can view your scheduled appointments and meetings.
              </span>
            </div>
          </div>
        )}

        {userRole === 'jobcoach' && (
          <div className="mb-4 p-4 bg-[hsl(var(--muted))] rounded-lg border border-[hsl(var(--border))]">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              <span className="text-sm text-[hsl(var(--muted-foreground))]">
                Click on any date to log your work hours (e.g., "TB 7" for 7 hours). View events for your assigned clients.
              </span>
            </div>
          </div>
        )}

        {userRole === 'admin' && (
          <div className="mb-4 p-4 bg-[hsl(var(--muted))] rounded-lg border border-[hsl(var(--border))]">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              <span className="text-sm text-[hsl(var(--muted-foreground))]">
                Full calendar access: Create events, schedule SLS days, and manage all appointments.
              </span>
            </div>
          </div>
        )}

        {/* Calendar Content */}
        {showLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 animate-spin" />
              <span className="text-muted-foreground">Loading calendar...</span>
            </div>
          </div>
        ) : combinedError ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-destructive mb-4">Failed to load calendar</p>
              <p className="text-sm text-muted-foreground mb-4">{combinedError}</p>
              <CalendarBox
                currentDate={currentDate}
                events={[]} // Show empty calendar on error
                onDateClick={handleDateClick}
                onEventClick={handleEventClick}
                viewMode={viewMode}
              />
            </div>
          </div>
        ) : (
          <CalendarBox
            currentDate={currentDate}
            events={filteredEvents} // Use filtered events based on role
            onDateClick={handleDateClick}
            onEventClick={handleEventClick}
            viewMode={viewMode}
          />
        )}

        {/* Event Modal - Read-only for clients/coaches */}
        <EventModal
          isOpen={isEventModalOpen}
          onClose={() => {
            setIsEventModalOpen(false);
            setSelectedEvent(null);
            setSelectedDate(null);
          }}
          onSubmit={selectedEvent ? handleUpdateEvent : handleCreateEvent}
          onDelete={selectedEvent ? handleDeleteEvent : undefined}
          selectedDate={selectedDate}
          selectedEvent={selectedEvent}
          isReadOnly={!permissions.canCreateEvents && !permissions.canEditEvents}
          userRole={userRole}
        />

        {/* Coach Hours Modal */}
        {permissions.canLogHours && (
          <CoachHoursModal
            isOpen={isHoursModalOpen}
            onClose={() => {
              setIsHoursModalOpen(false);
              setSelectedDate(null);
            }}
            onSubmit={handleLogHours}
            selectedDate={selectedDate}
            coachName={hallUser?.email || user?.email || 'Coach'}
          />
        )}
      </div>
    </>
  );
}