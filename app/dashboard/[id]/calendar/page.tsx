// app/dashboard/[id]/calendar/page.tsx - DRASTICALLY SIMPLIFIED
'use client';

import { useState, useEffect, useMemo } from 'react';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import CalendarMainContent from './_components/CalendarMainContent';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useAuth } from '@/app/provider';
import { useCalendarPermissions } from '@/hooks/useCalendarPermissions';

// Interfaces (kept minimal - main ones used by multiple components)
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
  
  // Basic state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isHoursModalOpen, setIsHoursModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [userRole, setUserRole] = useState<string>('user0x');
  const [roleLoading, setRoleLoading] = useState(true);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  
  // Admin state
  const [adminSelectedUser, setAdminSelectedUser] = useState<UserProfile | null>(null);
  const [showCalendarManager, setShowCalendarManager] = useState(false);
  const [showSLSManager, setShowSLSManager] = useState(false);
  const [slsSelectedUser, setSlsSelectedUser] = useState<UserProfile | null>(null);
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    date: null as Date | null,
    events: [] as CalendarEvent[],
    targetEvent: null as CalendarEvent | null
  });

  // Fetch user role
  useEffect(() => {
    async function fetchUserRole() {
      if (!user?.id) {
        setRoleLoading(false);
        return;
      }

      try {        
        const response = await fetch(`/api/profile/${user.id}`);
        if (!response.ok) throw new Error('Failed to fetch profile');
        
        const profileData = await response.json();
        setUserRole(profileData.role);
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
  
  // Permissions
  const isAdmin = userRole === 'admin1';
  const { 
    permissions: dynamicPermissions, 
    loading: permissionsLoading, 
    error: permissionsError 
  } = useCalendarPermissions(isAdmin ? null : user?.id || null, userRole);

  const fallbackPermissions = useMemo(() => {    
    switch (userRole) {
      case 'admin1':
        return { canCreateEvents: true, canEditEvents: true, canDeleteEvents: true, canLogHours: true, canViewAllEvents: true, canManageUsers: true, canExportData: true };
      case 'coachx7':
        return { canCreateEvents: false, canEditEvents: false, canDeleteEvents: false, canLogHours: true, canViewAllEvents: false, canManageUsers: false, canExportData: true };
      case 'client7x':
        return { canCreateEvents: false, canEditEvents: false, canDeleteEvents: false, canLogHours: false, canViewAllEvents: false, canManageUsers: false, canExportData: false };
      default:
        return { canCreateEvents: false, canEditEvents: false, canDeleteEvents: false, canLogHours: false, canViewAllEvents: false, canManageUsers: false, canExportData: false };
    }
  }, [userRole]);

  const finalPermissions = isAdmin ? fallbackPermissions : ((!permissionsLoading && !permissionsError && dynamicPermissions) ? dynamicPermissions : fallbackPermissions);

  // Calendar events
  const targetUserId = slsSelectedUser?.id || adminSelectedUser?.id || user?.id;
  const { events, loading, error, hasLoaded, createEvent, updateEvent, deleteEvent, logHours, loggingHours, refetch } = useCalendarEvents({
    startDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
    endDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0),
    userId: targetUserId,
    userRole: slsSelectedUser ? slsSelectedUser.role : (adminSelectedUser ? adminSelectedUser.role : userRole),
    coachName: slsSelectedUser?.display_name || adminSelectedUser?.display_name || user?.user_metadata?.display_name || user?.email || 'Unknown Coach'
  });

  const displayEvents = useMemo(() => {
    let baseEvents = events || [];
    if (userRole === 'admin1' && (adminSelectedUser || slsSelectedUser)) {
      return baseEvents;
    }
    return baseEvents;
  }, [events, userRole, adminSelectedUser, slsSelectedUser]);

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

  const handleGoToToday = () => setCurrentDate(new Date());

  // Event handlers
  const handleEventClick = (event: CalendarEvent) => {
    if (!event.is_hour_log && (finalPermissions.canEditEvents || finalPermissions.canViewAllEvents)) {
      setSelectedEvent(event);
      setSelectedDate(new Date(event.event_date));
      setIsEventModalOpen(true);
    }
  };

  const handleDateClick = (date: Date) => {
    console.log('📅 Date clicked from page:', date);
  };

  // Context menu handlers
  const handleDateRightClick = (e: React.MouseEvent, date: Date, events: CalendarEvent[]) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, date, events, targetEvent: null });
  };

  const handleEventRightClick = (e: React.MouseEvent, event: CalendarEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, date: new Date(event.event_date), events: [event], targetEvent: event });
  };

  const handleCloseContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, date: null, events: [], targetEvent: null });
  };

  // Action handlers
  const handleLogHours = (date?: Date) => {
    setSelectedDate(date || new Date());
    setIsHoursModalOpen(true);
  };

  const handleCreateEvent = (date?: Date) => {
    setSelectedDate(date || new Date());
    setSelectedEvent(null);
    setIsEventModalOpen(true);
  };

  // Admin handlers
  const handleAdminUserSelect = (selectedUser: UserProfile | null) => {
    setAdminSelectedUser(selectedUser);
    setShowCalendarManager(false);
    setShowSLSManager(false);
  };

  const handleSlsUserSelect = (selectedUser: UserProfile | null) => setSlsSelectedUser(selectedUser);

  const handleCreateSlsEvent = async (eventData: any) => {
    if (!slsSelectedUser || !user?.id) {
      console.error('No user selected or not authenticated');
      return;
    }

    try {
      const response = await fetch('/api/calendar/sls-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: eventData.title,
          description: eventData.description || eventData.notes,
          event_date: eventData.event_date,
          start_time: eventData.start_time,
          end_time: eventData.end_time,
          event_type: eventData.event_type,
          user_id: eventData.user_id,
          user_role: eventData.user_role,
          notes: eventData.notes,
          location: eventData.location || '',
          is_virtual: eventData.is_virtual || false,
          virtual_meeting_link: eventData.virtual_meeting_link || '',
          priority: eventData.priority || 'medium',
          created_by_id: user.id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create SLS event');
      }

      const result = await response.json();
      refetch();
      return result;
    } catch (error) {
      console.error('❌ Error creating SLS event:', error);
      throw error;
    }
  };

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
    setAdminSelectedUser(null);
    setSlsSelectedUser(null);
  };

  // Modal handlers
  const handleCreateEventSubmit = async (eventData: any) => {
    if (!finalPermissions.canCreateEvents) return;
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
    if (!selectedEvent || !finalPermissions.canEditEvents) return;
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
    if (!selectedEvent || !finalPermissions.canDeleteEvents) return;
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
    if (!finalPermissions.canLogHours) return;
    try {
      await logHours(hoursData);
      setIsHoursModalOpen(false);
      setSelectedDate(null);
    } catch (error) {
      console.error('Failed to log hours:', error);
      throw error;
    }
  };

  // Modal control handlers
  const handleCloseEventModal = () => {
    setIsEventModalOpen(false);
    setSelectedEvent(null);
    setSelectedDate(null);
  };

  const handleCloseHoursModal = () => {
    setIsHoursModalOpen(false);
    setSelectedDate(null);
  };

  // Export handlers
  const exportHandlers = {
    onExportStart: () => setExportMessage(null),
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
      
      <CalendarMainContent
        // Basic state
        currentDate={currentDate}
        userRole={userRole}
        roleLoading={roleLoading}
        permissionsLoading={permissionsLoading}
        showLoading={showLoading}
        loading={loading}
        loggingHours={loggingHours}
        viewMode={viewMode}
        
        // Data
        displayEvents={displayEvents}
        finalPermissions={finalPermissions}
        exportMessage={exportMessage}
        
        // Admin state
        adminSelectedUser={adminSelectedUser}
        slsSelectedUser={slsSelectedUser}
        showCalendarManager={showCalendarManager}
        showSLSManager={showSLSManager}
        
        // Modal state
        isEventModalOpen={isEventModalOpen}
        isHoursModalOpen={isHoursModalOpen}
        selectedEvent={selectedEvent}
        selectedDate={selectedDate}
        
        // Context menu state
        contextMenu={contextMenu}
        
        // User
        user={user}
        
        // Navigation handlers
        onNavigateMonth={handleNavigateMonth}
        onGoToToday={handleGoToToday}
        onSetViewMode={setViewMode}
        
        // Calendar interaction handlers
        onEventClick={handleEventClick}
        onDateClick={handleDateClick}
        onDateRightClick={handleDateRightClick}
        onEventRightClick={handleEventRightClick}
        onCloseContextMenu={handleCloseContextMenu}
        
        // Action handlers
        onLogHours={handleLogHours}
        onCreateEvent={handleCreateEvent}
        
        // Admin handlers
        onAdminUserSelect={handleAdminUserSelect}
        onSlsUserSelect={handleSlsUserSelect}
        onCreateSlsEvent={handleCreateSlsEvent}
        onOpenCalendarManager={handleOpenCalendarManager}
        onOpenSLSManager={handleOpenSLSManager}
        onCloseAdminModals={handleCloseAdminModals}
        
        // Modal handlers
        onCreateEventSubmit={handleCreateEventSubmit}
        onUpdateEventSubmit={handleUpdateEventSubmit}
        onDeleteEvent={handleDeleteEvent}
        onHoursSubmit={handleHoursSubmit}
        
        // Modal control handlers
        onCloseEventModal={handleCloseEventModal}
        onCloseHoursModal={handleCloseHoursModal}
        
        // Export handlers
        exportHandlers={exportHandlers}
        
        // Refetch
        refetch={refetch}
      />
    </>
  );
}