// app/dashboard/[id]/calendar/page.tsx - FIXED: Added CalendarExport component
'use client';

import { useState, useEffect, useMemo } from 'react';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import EventModal from './_components/EventModal';
import CoachHoursModal from './_components/CoachHoursModal';
import CalendarHeader from './_components/CalendarHeader';
import CalendarExport from './_components/CalendarExport';
import UserRoleInfoPanel from './_components/UserRoleInfoPanel';
import ExportMessage from './_components/ExportMessage';
import CalendarContent from './_components/CalendarContent';
import UserCalendarViewer from './_components/UserCalendarViewer';
import CalendarManager from './_components/CalendarManager';
import SLSManager from './_components/SLSManager';
import CalendarContextMenu from './_components/CalendarContextMenu';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useAuth } from '@/app/provider';
import { useCalendarPermissions } from '@/hooks/useCalendarPermissions';
import { useCalendarRole } from '@/hooks/useCalendarRole';
import { useCalendarModals } from '@/hooks/useCalendarModals';

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
  const { userRole, setUserRole, roleLoading, isAdmin, fallbackPermissions } = useCalendarRole(user);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  
  const [adminSelectedUser, setAdminSelectedUser] = useState<UserProfile | null>(null);
  const [showCalendarManager, setShowCalendarManager] = useState(false);
  const [showSLSManager, setShowSLSManager] = useState(false);
  
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    date: null as Date | null,
    events: [] as CalendarEvent[],
    targetEvent: null as CalendarEvent | null
  });

  const [slsSelectedUser, setSlsSelectedUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.calendar-day') && !target.closest('.calendar-event')) {
        e.preventDefault();
      }
    };
    
    const preventDefault = (e: Event) => e.preventDefault();
    
    document.addEventListener('selectstart', preventDefault);
    document.addEventListener('dragstart', preventDefault);
    document.addEventListener('contextmenu', handleContextMenu);
    
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.mozUserSelect = 'none';
    document.body.style.msUserSelect = 'none';
    document.body.style.webkitTouchCallout = 'none';
    document.body.style.webkitUserDrag = 'none';
    
    return () => {
      document.removeEventListener('selectstart', preventDefault);
      document.removeEventListener('dragstart', preventDefault);
      document.removeEventListener('contextmenu', handleContextMenu);
      
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      document.body.style.mozUserSelect = '';
      document.body.style.msUserSelect = '';
      document.body.style.webkitTouchCallout = '';
      document.body.style.webkitUserDrag = '';
    };
  }, []);
  
  const { 
    permissions: dynamicPermissions, 
    loading: permissionsLoading, 
    error: permissionsError,
    hasPermission,
    refetch: refetchPermissions 
  } = useCalendarPermissions(isAdmin ? null : user?.id || null, userRole);

  const finalPermissions = isAdmin 
    ? fallbackPermissions
    : ((!permissionsLoading && !permissionsError && dynamicPermissions) 
        ? dynamicPermissions 
        : fallbackPermissions);

  useEffect(() => {
    console.log('🔐 Permissions Debug:', {
      userRole,
      isAdmin,
      permissionsLoading,
      permissionsError,
      dynamicPermissions,
      fallbackPermissions,
      finalPermissions,
      clientCanExport: userRole === 'client7x' ? finalPermissions.canExportData : 'N/A'
    });
  }, [userRole, isAdmin, permissionsLoading, permissionsError, dynamicPermissions, fallbackPermissions, finalPermissions]);

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

  const modalHandlers = useCalendarModals(
    { createEvent, updateEvent, deleteEvent, logHours },
    finalPermissions
  );

  const displayEvents = useMemo(() => {
    let baseEvents = events || [];
    
    if (userRole === 'admin1' && (adminSelectedUser || slsSelectedUser)) {
      return baseEvents;
    }
    
    switch (userRole) {
      case 'admin1':
        return baseEvents;
      case 'coachx7':
        return baseEvents;
      case 'client7x':
        return baseEvents;
      default:
        return [];
    }
  }, [events, userRole, adminSelectedUser, slsSelectedUser]);

  const showLoading = (loading && !hasLoaded) || roleLoading;
  const isLoadingTargetUser = (slsSelectedUser || adminSelectedUser) && loading;
  const isLoadingOwnCalendar = (!slsSelectedUser && !adminSelectedUser) && loading;

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

  const handleContextViewEvents = (date: Date, events: CalendarEvent[]) => {
    console.log(`📋 Viewing ${events.length} events for ${date.toLocaleDateString()}`);
    if (events.length > 0) {
      modalHandlers.handleEditEvent(events[0]);
    }
  };

  const handleDateClick = (date: Date) => {
    console.log('📅 Date clicked/tapped (VIEW MODE):', date);
    return;
  };

  const handleEventClick = (event: CalendarEvent) => {
    console.log('🎯 Event clicked (VIEW MODE):', event.title);
    return;
  };

  const handleAdminUserSelect = (selectedUser: UserProfile | null) => {
    setAdminSelectedUser(selectedUser);
    setShowCalendarManager(false);
    setShowSLSManager(false);
  };

  const handleSlsUserSelect = (selectedUser: UserProfile | null) => {
    setSlsSelectedUser(selectedUser);
  };

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

        <CalendarHeader
          currentDate={currentDate}
          viewMode={viewMode}
          userRole={userRole}
          roleLoading={roleLoading}
          loggingHours={loggingHours}
          optimisticCount={0}
          permissions={finalPermissions}
          onNavigateMonth={handleNavigateMonth}
          onGoToToday={handleGoToToday}
          onSetViewMode={setViewMode}
          onOpenHoursModal={modalHandlers.handleLogHours}
          onOpenEventModal={modalHandlers.handleCreateEvent}
        />

        {finalPermissions.canExportData && (
          <div className="mb-6 flex justify-end">
            <CalendarExport
              currentDate={currentDate}
              events={displayEvents}
              userRole={userRole}
              userId={user?.id || ''}
              userName={user?.user_metadata?.display_name || user?.email}
              userEmail={user?.email}
              department={user?.user_metadata?.department}
              specialization={user?.user_metadata?.specialization}
              onExportStart={exportHandlers.onExportStart}
              onExportComplete={exportHandlers.onExportComplete}
              onExportError={exportHandlers.onExportError}
            />
          </div>
        )}

        <ExportMessage message={exportMessage} />

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

        <UserRoleInfoPanel 
          userRole={userRole} 
          roleLoading={roleLoading}
          selectedUser={slsSelectedUser || adminSelectedUser}
        />

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
          onDateRightClick={handleDateRightClick}
          onEventRightClick={handleEventRightClick}
          disableBrowserDefaults={true}
        />

        <CalendarContextMenu
          menu={contextMenu}
          permissions={finalPermissions}
          userRole={userRole}
          onClose={handleCloseContextMenu}
          onCreateEvent={modalHandlers.handleCreateEvent}
          onLogHours={modalHandlers.handleLogHours}
          onEditEvent={modalHandlers.handleEditEvent}
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

        {(finalPermissions.canCreateEvents || finalPermissions.canEditEvents) && (
          <EventModal
            isOpen={modalHandlers.isEventModalOpen}
            onClose={modalHandlers.handleCloseEventModal}
            onSubmit={modalHandlers.selectedEvent ? modalHandlers.handleUpdateEventSubmit : modalHandlers.handleCreateEventSubmit}
            onDelete={modalHandlers.selectedEvent && finalPermissions.canDeleteEvents ? modalHandlers.handleDeleteEvent : undefined}
            selectedDate={modalHandlers.selectedDate}
            selectedEvent={modalHandlers.selectedEvent}
          />
        )}

        {finalPermissions.canLogHours && (
          <CoachHoursModal
            isOpen={modalHandlers.isHoursModalOpen}
            onClose={modalHandlers.handleCloseHoursModal}
            onSubmit={modalHandlers.handleHoursSubmit}
            selectedDate={modalHandlers.selectedDate}
            coachName={slsSelectedUser?.display_name || adminSelectedUser?.display_name || user?.user_metadata?.display_name || user?.email || 'Unknown Coach'}
          />
        )}

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