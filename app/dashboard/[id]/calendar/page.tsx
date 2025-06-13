// app/dashboard/[id]/calendar/page.tsx - FIXED: Removed client filtering to trust API permissions
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
import SLSManager from './_components/SLSManager'; // ADDED: Missing import
import CalendarContextMenu from './_components/CalendarContextMenu'; // Import the new context menu
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useAuth } from '@/app/provider';
import { useCalendarPermissions } from '@/hooks/useCalendarPermissions';

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

// FIXED: Updated interface to match the API and useCalendarEvents hook
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
  
  // NEW: Context menu state
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    date: null as Date | null,
    events: [] as CalendarEvent[],
    targetEvent: null as CalendarEvent | null
  });

  // SLS Manager specific state
  const [slsSelectedUser, setSlsSelectedUser] = useState<UserProfile | null>(null);

  // INTEGRATED: Disable browser behaviors but allow our context menu
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      // Only prevent default if it's not our calendar context menu
      const target = e.target as HTMLElement;
      if (!target.closest('.calendar-day') && !target.closest('.calendar-event')) {
        e.preventDefault();
      }
    };
    
    const preventDefault = (e: Event) => e.preventDefault();
    
    // Disable text selection and drag behaviors
    document.addEventListener('selectstart', preventDefault);
    document.addEventListener('dragstart', preventDefault);
    document.addEventListener('contextmenu', handleContextMenu);
    
    // Disable text selection globally
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.mozUserSelect = 'none';
    document.body.style.msUserSelect = 'none';
    
    // Disable touch callouts on mobile
    document.body.style.webkitTouchCallout = 'none';
    document.body.style.webkitUserDrag = 'none';
    
    return () => {
      document.removeEventListener('selectstart', preventDefault);
      document.removeEventListener('dragstart', preventDefault);
      document.removeEventListener('contextmenu', handleContextMenu);
      
      // Restore default behaviors on cleanup
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      document.body.style.mozUserSelect = '';
      document.body.style.msUserSelect = '';
      document.body.style.webkitTouchCallout = '';
      document.body.style.webkitUserDrag = '';
    };
  }, []);

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
  
  // FIXED: Admin permissions should be role-based, not user-specific
  // If user is admin, use hardcoded admin permissions immediately
  const isAdmin = userRole === 'admin1';
  
  // For admins: use fallback permissions immediately (role-based)
  // For others: try dynamic permissions first, then fallback
  const { 
    permissions: dynamicPermissions, 
    loading: permissionsLoading, 
    error: permissionsError,
    hasPermission,
    refetch: refetchPermissions 
  } = useCalendarPermissions(isAdmin ? null : user?.id || null, userRole);

  // FALLBACK: Static permissions in case dynamic permissions fail - RESTORED EXPORT FOR ALL
  const fallbackPermissions = useMemo(() => {    
    switch (userRole) {
      case 'admin1':
        return {
          canCreateEvents: true,
          canEditEvents: true,
          canDeleteEvents: true,
          canLogHours: true,  // FIXED: Admins can log hours
          canViewAllEvents: true,
          canManageUsers: true,
          canExportData: true // RESTORED: Admins can export
        };
      case 'coachx7':
        return {
          canCreateEvents: false,
          canEditEvents: false,
          canDeleteEvents: false,
          canLogHours: true,
          canViewAllEvents: false,
          canManageUsers: false,
          canExportData: true // RESTORED: Coaches can export
        };
      case 'client7x':
        return {
          canCreateEvents: false,
          canEditEvents: false,
          canDeleteEvents: false,
          canLogHours: false,
          canViewAllEvents: false,
          canManageUsers: false,
          canExportData: true // 🔥 ENSURED: Clients can export
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

  // Use role-based permissions for admins, dynamic for others
  const finalPermissions = isAdmin 
    ? fallbackPermissions // Admins always get full permissions based on role
    : ((!permissionsLoading && !permissionsError && dynamicPermissions) 
        ? dynamicPermissions 
        : fallbackPermissions);

  // Debug log for permissions (remove this after testing)
  useEffect(() => {
    console.log('🔐 Permissions Debug:', {
      userRole,
      isAdmin,
      permissionsLoading,
      permissionsError,
      dynamicPermissions,
      fallbackPermissions,
      finalPermissions,
      // 🔥 SPECIFIC DEBUG FOR EXPORT
      clientCanExport: userRole === 'client7x' ? finalPermissions.canExportData : 'N/A'
    });
  }, [userRole, isAdmin, permissionsLoading, permissionsError, dynamicPermissions, fallbackPermissions, finalPermissions]);

  // Get events for current user OR selected admin target user OR SLS selected user
  const targetUserId = slsSelectedUser?.id || adminSelectedUser?.id || user?.id;
  
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
    coachName: slsSelectedUser?.display_name || adminSelectedUser?.display_name || user?.user_metadata?.display_name || user?.email || 'Unknown Coach'
  });

  // FIXED: Trust API filtering - no additional frontend filtering for clients
  const displayEvents = useMemo(() => {
    let baseEvents = events || [];
    
    // If admin is viewing another user's calendar (from either selector), show all events for that user
    if (userRole === 'admin1' && (adminSelectedUser || slsSelectedUser)) {
      return baseEvents; // Show all events for the target user
    }
    
    // FIXED: Let API handle permissions - only apply filtering for specific admin/coach use cases
    switch (userRole) {
      case 'admin1':
        // Admins see all events - no filtering needed
        return baseEvents;
      
      case 'coachx7':
        // For coaches, we might want to filter in some cases, but for now trust the API
        return baseEvents;
      
      case 'client7x':
        // FIXED: Trust the API filtering - it already handles permissions correctly
        // The API filters to show: assigned events OR events visible to clients (like paydays)
        return baseEvents;
      
      default:
        return [];
    }
  }, [events, userRole, adminSelectedUser, slsSelectedUser]);

  // Calculate loading state with more granular info
  const showLoading = (loading && !hasLoaded) || roleLoading;
  const isLoadingTargetUser = (slsSelectedUser || adminSelectedUser) && loading;
  const isLoadingOwnCalendar = (!slsSelectedUser && !adminSelectedUser) && loading;

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

  // FIXED: Right-click context menu handlers
  const handleDateRightClick = (e: React.MouseEvent, date: Date, events: CalendarEvent[]) => {
    e.preventDefault();
    console.log('📅 Date right-clicked (CONTEXT MENU):', date);
    
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      date,
      events,
      targetEvent: null
    });
  };

  const handleEventRightClick = (e: React.MouseEvent, event: CalendarEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🎯 Event right-clicked (CONTEXT MENU):', event.title);
    
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      date: new Date(event.event_date),
      events: [event],
      targetEvent: event
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu({
      visible: false,
      x: 0,
      y: 0,
      date: null,
      events: [],
      targetEvent: null
    });
  };

  // Context menu action handlers
  const handleContextViewEvents = (date: Date, events: CalendarEvent[]) => {
    console.log(`📋 Viewing ${events.length} events for ${date.toLocaleDateString()}`);
    // Could open a detailed view modal or expand the first event
    if (events.length > 0) {
      // For now, just edit the first event
      setSelectedEvent(events[0]);
      setSelectedDate(new Date(events[0].event_date));
      setIsEventModalOpen(true);
    }
  };

  // SIMPLIFIED: Event handlers - Left click shows popup, Right click shows context menu
  const handleDateClick = (date: Date) => {
    console.log('📅 Date clicked/tapped (VIEW MODE):', date);
    // Let CalendarContent handle showing popup/tooltip
    return;
  };

  const handleEventClick = (event: CalendarEvent) => {
    console.log('🎯 Event clicked (VIEW MODE):', event.title);
    // Let CalendarContent handle showing popup/tooltip  
    return;
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

  // Handle SLS event creation
  const handleCreateSlsEvent = async (eventData: any) => {
    if (!slsSelectedUser || !user?.id) {
      console.error('No user selected or not authenticated');
      return;
    }

    console.log('🔥 Calendar page received event data from SLS Manager:', eventData);

    try {
      const response = await fetch('/api/calendar/sls-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      console.log('✅ SLS event created successfully:', result);
      
      // Refresh calendar to show new event
      refetch();
      
      return result;
    } catch (error) {
      console.error('❌ Error creating SLS event:', error);
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
    // RESTORED: Clear selected users when closing managers to go back to own calendar
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

  // FIXED: Updated to match the correct interface
  const handleHoursSubmit = async (hoursData: CoachHoursData) => {
    if (!finalPermissions.canLogHours) return;

    try {
      console.log('🏗️ Calendar page submitting hours:', hoursData);
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
        {/* Progress Bar for Loading States */}
        {(showLoading || permissionsLoading) && (
          <div className="mb-4">
            <div className="bg-gray-200 rounded-full h-2 mb-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
            </div>
            <div className="text-sm text-gray-600 text-center">
              {roleLoading && "Loading user role..."}
              {permissionsLoading && "Loading permissions..."}
              {isLoadingTargetUser && `Loading ${slsSelectedUser?.display_name || adminSelectedUser?.display_name || 'target user'}'s calendar...`}
              {isLoadingOwnCalendar && "Loading your calendar..."}
            </div>
          </div>
        )}

        {/* 🔥 CRITICAL: Calendar Header - Using finalPermissions (which includes export for clients) */}
        <CalendarHeader
          currentDate={currentDate}
          viewMode={viewMode}
          userRole={userRole}
          roleLoading={roleLoading}
          loggingHours={loggingHours}
          optimisticCount={0}
          permissions={finalPermissions} // ✅ CORRECT: This should enable export for clients
          onNavigateMonth={handleNavigateMonth}
          onGoToToday={handleGoToToday}
          onSetViewMode={setViewMode}
          onOpenHoursModal={handleLogHours}
          onOpenEventModal={handleCreateEvent}
          exportHandlers={exportHandlers} // ✅ RESTORED: Export functionality
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

        {/* SIMPLIFIED: Calendar Content with right-click context menu */}
        <CalendarContent
          showLoading={showLoading}
          error={error}
          roleLoading={roleLoading}
          currentDate={currentDate}
          displayEvents={displayEvents}
          viewMode={viewMode}
          userRole={userRole}
          onDateClick={handleDateClick} // Left click = show popup
          onEventClick={handleEventClick} // Left click = show popup
          onRefetch={refetch}
          // NEW: Right-click handlers for context menu
          onDateRightClick={handleDateRightClick}
          onEventRightClick={handleEventRightClick}
          disableBrowserDefaults={true}
        />

        {/* NEW: Context Menu */}
        <CalendarContextMenu
          menu={contextMenu}
          permissions={finalPermissions}
          userRole={userRole}
          onClose={handleCloseContextMenu}
          onCreateEvent={handleCreateEvent}
          onLogHours={handleLogHours}
          onEditEvent={(event) => {
            setSelectedEvent(event);
            setSelectedDate(new Date(event.event_date));
            setIsEventModalOpen(true);
          }}
          onDeleteEvent={async (event) => {
            if (finalPermissions.canDeleteEvents) {
              try {
                await deleteEvent(event.id);
                console.log('Event deleted:', event.title);
              } catch (error) {
                console.error('Failed to delete event:', error);
              }
            }
          }}
          onViewEvents={handleContextViewEvents}
        />

        {/* Event Modal - only show for users with event permissions */}
        {(finalPermissions.canCreateEvents || finalPermissions.canEditEvents) && (
          <EventModal
            isOpen={isEventModalOpen}
            onClose={() => {
              setIsEventModalOpen(false);
              setSelectedEvent(null);
              setSelectedDate(null);
            }}
            onSubmit={selectedEvent ? handleUpdateEventSubmit : handleCreateEventSubmit}
            onDelete={selectedEvent && finalPermissions.canDeleteEvents ? handleDeleteEvent : undefined}
            selectedDate={selectedDate}
            selectedEvent={selectedEvent}
          />
        )}

        {/* Coach Hours Modal - only show for coaches and admins with logHours permission */}
        {finalPermissions.canLogHours && (
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

        {/* SLS Manager - Fixed with proper props */}
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

        {/* SIMPLIFIED: Interaction instructions */}
        <div className="mt-4 p-3 bg-[hsl(var(--muted))] rounded-lg border">
          <div className="text-sm text-[hsl(var(--muted-foreground))]">
            <div className="font-medium mb-2 text-[hsl(var(--foreground))]">📱 Interaction Guide:</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div>• <strong>Left click/tap:</strong> View details popup</div>
              <div>• <strong>Right click:</strong> Action menu (create, edit, copy, delete)</div>
              <div>• <strong>Mobile long press:</strong> Same as right click</div>
              <div>• <strong>Browser selection:</strong> Disabled for better mobile experience</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}