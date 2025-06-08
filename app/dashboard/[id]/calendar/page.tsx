// app/dashboard/[id]/calendar/page.tsx - Fixed SLSManager props
'use client';

import { useState, useEffect, useMemo } from 'react';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import EventModal from './_components/EventModal';
import CoachHoursModal from './_components/CoachHoursModal';
import CalendarHeader from './_components/CalendarHeader';
import UserRoleInfoPanel from './_components/UserRoleInfoPanel';
import ExportMessage from './_components/ExportMessage';
import CalendarContent from './_components/CalendarContent';
import UserCalendarViewer from './_components/UserCalendarViewer';
import CalendarManager from './_components/CalendarManager';
import SLSManager from './_components/SLSManager';
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
  is_payday?: boolean;
  is_holiday?: boolean;
  is_sales_day?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  location?: string;
  amount?: number;
  duration_minutes: number;
}

interface CoachHoursData {
  report_date: string;
  hours_worked: number;
  work_location_id?: string;
  location?: string;
  activity_type?: string;
  notes?: string;
  initials?: string;
}

interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  role: string;
  department?: string;
  specialization?: string;
  avatar_url?: string;
  created_at: string;
  last_sign_in?: string;
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
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  
  // Admin overlay states
  const [adminSelectedUser, setAdminSelectedUser] = useState<UserProfile | null>(null);
  const [showCalendarManager, setShowCalendarManager] = useState(false);
  const [showSLSManager, setShowSLSManager] = useState(false);
  
  // SLS Manager specific state
  const [slsSelectedUser, setSlsSelectedUser] = useState<UserProfile | null>(null);

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
          canManageUsers: true,
          canExportData: true
        };
      case 'coachx7':
        return {
          canCreateEvents: false,
          canEditEvents: false,
          canDeleteEvents: false,
          canLogHours: true,
          canViewAllEvents: false,
          canManageUsers: false,
          canExportData: true
        };
      case 'client7x':
        return {
          canCreateEvents: false,
          canEditEvents: false,
          canDeleteEvents: false,
          canLogHours: false,
          canViewAllEvents: false,
          canManageUsers: false,
          canExportData: false
        };
      default:
        return {
          canCreateEvents: false,
          canEditEvents: false,
          canDeleteEvents: false,
          canLogHours: false,
          canViewAllEvents: false,
          canManageUsers: false,
          canExportData: false
        };
    }
  }, [userRole]);

  // Get events for current user OR selected admin target user OR SLS selected user
  // If either manager is open but no user is selected, don't show any events
  const targetUserId = slsSelectedUser?.id || adminSelectedUser?.id || 
    (showCalendarManager || showSLSManager ? null : user?.id);
  
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
    refetch
  } = useCalendarEvents({
    startDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
    endDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0),
    userId: targetUserId,
    userRole: slsSelectedUser ? slsSelectedUser.role : (adminSelectedUser ? adminSelectedUser.role : userRole),
    coachName: slsSelectedUser?.display_name || adminSelectedUser?.display_name || user?.user_metadata?.display_name || user?.email || 'Unknown Coach',
    enabled: targetUserId !== null // Only fetch events if we have a target user
  });

  // Filter events based on role (viewing user's role, not target user's role)
  const displayEvents = useMemo(() => {
    // If either manager is open but no user is selected, show empty calendar
    if ((showCalendarManager || showSLSManager) && !slsSelectedUser && !adminSelectedUser) {
      return [];
    }

    let baseEvents = events || [];
    
    // If admin is viewing another user's calendar (from either selector), show all events for that user
    if (userRole === 'admin1' && (adminSelectedUser || slsSelectedUser)) {
      return baseEvents; // Show all events for the target user
    }
    
    // Otherwise, apply normal role-based filtering
    switch (userRole) {
      case 'admin1':
        // Admins see all events        
        break;
      
      case 'coachx7':
        // Job coaches see their own hour logs + assigned client events
        baseEvents = baseEvents.filter(event => 
          event.is_hour_log || // Show all hour logs for coaches
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
          event.is_hour_log
        );        
        break;
      
      default:
        baseEvents = [];
        break;
    }

    return baseEvents;
  }, [events, userRole, user, adminSelectedUser, slsSelectedUser, showCalendarManager, showSLSManager]);

  // Calculate loading state
  const showLoading = (loading && !hasLoaded) || roleLoading;

  // Navigation handlers
  const handleNavigateMonth = (direction: 'prev' | 'next') => {
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

  const handleGoToToday = () => {
    setCurrentDate(new Date());
  };

  // Event handlers
  const handleDateClick = (date: Date) => {
    console.log('Date clicked:', date, 'Events for this date will be shown by calendar component');
  };

  const handleEventClick = (event: CalendarEvent) => {
    if (event.is_hour_log) {
      return; // Let calendar component handle hour log tooltips
    }

    if (permissions.canEditEvents || permissions.canViewAllEvents) {
      setSelectedEvent(event);
      setSelectedDate(new Date(event.event_date));
      setIsEventModalOpen(true);
    }
  };

  // Action handlers
  const handleLogHours = () => {
    setSelectedDate(new Date());
    setIsHoursModalOpen(true);
  };

  const handleCreateEvent = () => {
    setSelectedDate(new Date());
    setSelectedEvent(null);
    setIsEventModalOpen(true);
  };

  // Admin user selection handler
  const handleAdminUserSelect = (selectedUser: UserProfile | null) => {
    setAdminSelectedUser(selectedUser);
    // Close any open admin modals when user changes
    setShowCalendarManager(false);
    setShowSLSManager(false);
  };

  // SLS Manager user selection handler
  const handleSlsUserSelect = (selectedUser: UserProfile | null) => {
    setSlsSelectedUser(selectedUser);
  };

  // Handle SLS event creation (moved from SLSManager to parent)
  const handleCreateSlsEvent = async (eventData: any) => {
    if (!slsSelectedUser || !user?.id) {
      console.error('No user selected or not authenticated');
      return;
    }

    try {
      const response = await fetch('/api/calendar/sls-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: eventData.title,
          description: eventData.notes,
          event_date: eventData.date,
          start_time: eventData.time,
          end_time: eventData.endTime, // Calculate this in SLS Manager
          event_type: eventData.eventType,
          user_id: slsSelectedUser.id,
          user_role: slsSelectedUser.role,
          notes: eventData.notes,
          location: eventData.location,
          is_virtual: eventData.isVirtual || false,
          virtual_meeting_link: eventData.virtualLink,
          priority: 'medium',
          created_by_id: user.id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create SLS event');
      }

      const result = await response.json();
      console.log('SLS event created successfully:', result);
      
      // Refresh calendar to show new event
      refetch();
      
      return result;
    } catch (error) {
      console.error('Error creating SLS event:', error);
      throw error;
    }
  };

  // Admin modal handlers
  const handleOpenCalendarManager = () => {
    setShowCalendarManager(true);
    setShowSLSManager(false);
  };

  const handleOpenSLSManager = () => {
    setShowSLSManager(true);
    setShowCalendarManager(false);
  };

  const handleCloseAdminModals = () => {
    setShowCalendarManager(false);
    setShowSLSManager(false);
  };

  // Modal handlers
  const handleCreateEventSubmit = async (eventData: any) => {
    if (!permissions.canCreateEvents) return;

    try {
      await createEvent(eventData);
      setIsEventModalOpen(false);
      setSelectedEvent(null);
      setSelectedDate(null);
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  const handleUpdateEventSubmit = async (eventData: any) => {
    if (!selectedEvent || !permissions.canEditEvents) return;
    
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
    if (!selectedEvent || !permissions.canDeleteEvents) return;
    
    try {
      await deleteEvent(selectedEvent.id);
      setIsEventModalOpen(false);
      setSelectedEvent(null);
      setSelectedDate(null);
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  const handleHoursSubmit = async (hoursData: CoachHoursData) => {
    if (!permissions.canLogHours) return;

    try {
      await logHours(hoursData);
      setIsHoursModalOpen(false);
      setSelectedDate(null);
    } catch (error) {
      console.error('Failed to log hours:', error);
      throw error;
    }
  };

  // Export handlers
  const exportHandlers = {
    onExportStart: () => {
      setExportMessage(null);
    },
    onExportComplete: () => {
      setExportMessage('Calendar exported successfully!');
      setTimeout(() => setExportMessage(null), 3000);
    },
    onExportError: (error: string) => {
      setExportMessage(`Export failed: ${error}`);
      setTimeout(() => setExportMessage(null), 5000);
    }
  };

  // Early return for unauthenticated users
  if (!user) {
    return (
      <>
        <Breadcrumb pageName="Calendar" />
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <p className="text-[hsl(var(--muted-foreground))]">Please sign in to view your calendar.</p>
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
        <CalendarHeader
          currentDate={currentDate}
          viewMode={viewMode}
          userRole={userRole}
          roleLoading={roleLoading}
          loading={loading}
          hasLoaded={hasLoaded}
          loggingHours={loggingHours}
          permissions={permissions}
          user={user}
          displayEvents={displayEvents}
          showLoading={showLoading}
          exportHandlers={exportHandlers}
          onNavigateMonth={handleNavigateMonth}
          onGoToToday={handleGoToToday}
          onViewModeChange={setViewMode}
          onLogHours={handleLogHours}
          onCreateEvent={handleCreateEvent}
        />

        {/* Export Message */}
        <ExportMessage message={exportMessage} />

        {/* Admin User Calendar Viewer - Only for Admins */}
        {userRole === 'admin1' && (
          <UserCalendarViewer
            currentDate={currentDate}
            userRole={userRole}
            onUserSelect={handleAdminUserSelect}
            selectedUser={adminSelectedUser}
            onOpenCalendarManager={handleOpenCalendarManager}
            onOpenSLSManager={handleOpenSLSManager}
          />
        )}

        {/* Role-based info panel - Updated to show target user info */}
        <UserRoleInfoPanel 
          userRole={userRole} 
          roleLoading={roleLoading}
          selectedUser={slsSelectedUser || adminSelectedUser}
        />

        {/* Calendar Content */}
        <CalendarContent
          showLoading={showLoading}
          error={error}
          roleLoading={roleLoading}
          currentDate={currentDate}
          displayEvents={displayEvents}
          viewMode={viewMode}
          userRole={userRole}
          onDateClick={handleDateClick}
          onEventClick={handleEventClick}
          onRefetch={refetch}
        />

        {/* Event Modal - only show for users with event permissions */}
        {(permissions.canCreateEvents || permissions.canEditEvents) && (
          <EventModal
            isOpen={isEventModalOpen}
            onClose={() => {
              setIsEventModalOpen(false);
              setSelectedEvent(null);
              setSelectedDate(null);
            }}
            onSubmit={selectedEvent ? handleUpdateEventSubmit : handleCreateEventSubmit}
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
            coachName={slsSelectedUser?.display_name || adminSelectedUser?.display_name || user?.user_metadata?.display_name || user?.email || 'Unknown Coach'}
          />
        )}

        {/* Calendar Manager - Integrated into page */}
        {showCalendarManager && (
          <div className="mb-6">
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg shadow-sm">
              <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
                <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Calendar Manager</h2>
                <button
                  onClick={handleCloseAdminModals}
                  className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] p-2 rounded-md hover:bg-[hsl(var(--background))] transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="p-4">
                <CalendarManager
                  currentDate={currentDate}
                  userRole={userRole}
                />
              </div>
            </div>
          </div>
        )}

        {/* SLS Manager - Integrated into page with proper props */}
        {showSLSManager && (
          <div className="mb-6">
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg shadow-sm">
              <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
                <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">SLS Manager</h2>
                <button
                  onClick={handleCloseAdminModals}
                  className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] p-2 rounded-md hover:bg-[hsl(var(--background))] transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="p-4">
                <SLSManager
                  currentDate={currentDate}
                  userRole={userRole}
                  onUserSelect={handleSlsUserSelect}
                  selectedUser={slsSelectedUser}
                  onCreateSlsEvent={handleCreateSlsEvent}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}