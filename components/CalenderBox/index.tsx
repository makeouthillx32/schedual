// Streamlined CalendarBox - Handles all interactions internally
'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import CalendarEvent from './CalendarEvent';
import EventTooltip from './EventTooltip';

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
  duration_minutes: number;
  is_hour_log?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  location?: string;
  amount?: number;
}

interface CalendarBoxProps {
  currentDate: Date;
  events: CalendarEvent[];
  userRole: string;
  viewMode?: 'month' | 'week' | 'day';
  loading?: boolean;
  // Action handlers - passed from parent for actual functionality
  onCreateEvent?: (date: Date) => void;
  onLogHours?: (date: Date) => void;
  onEditEvent?: (event: CalendarEvent) => void;
  onDeleteEvent?: (event: CalendarEvent) => void;
}

const CalendarBox = ({
  currentDate,
  events = [],
  userRole,
  viewMode = 'month',
  loading = false,
  onCreateEvent,
  onLogHours,
  onEditEvent,
  onDeleteEvent
}: CalendarBoxProps) => {
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [clickedDate, setClickedDate] = useState<Date | null>(null);
  const [tooltipType, setTooltipType] = useState<'hover' | 'clicked-date' | 'clicked-event'>('hover');
  const [isMobile, setIsMobile] = useState(false);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    date: null as Date | null,
    events: [] as CalendarEvent[]
  });
  
  const calendarRef = useRef<HTMLDivElement>(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  // Group events by date for performance
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {};
    events.forEach(event => {
      if (!grouped[event.event_date]) {
        grouped[event.event_date] = [];
      }
      grouped[event.event_date].push(event);
    });
    return grouped;
  }, [events]);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return eventsByDate[dateString] || [];
  };

  // Format time for display
  const formatTime = (timeString: string, isHourLog?: boolean) => {
    if (isHourLog || timeString === 'All Day') return '';
    try {
      const [hours, minutes] = timeString.split(':').map(Number);
      const hour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      return `${hour}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    } catch {
      return '';
    }
  };

  // Get permissions based on user role
  const permissions = useMemo(() => {
    switch (userRole) {
      case 'admin1':
        return { canCreateEvents: true, canLogHours: true, canEditEvents: true, canDeleteEvents: true };
      case 'coachx7':
        return { canCreateEvents: false, canLogHours: true, canEditEvents: false, canDeleteEvents: false };
      default:
        return { canCreateEvents: false, canLogHours: false, canEditEvents: false, canDeleteEvents: false };
    }
  }, [userRole]);

  // Cell styling
  const getCellClass = (date: Date, dayEvents: CalendarEvent[]) => {
    let baseClass = `
      relative cursor-pointer border border-[hsl(var(--border))] 
      transition-all duration-200 ease-in-out
      hover:bg-[hsl(var(--muted))] hover:shadow-sm
      ${isMobile ? 'h-16 p-1' : 'h-20 p-2 md:h-24 md:p-3'}
    `;
    
    if (!isSameMonth(date, currentDate)) {
      baseClass += " opacity-50 bg-[hsl(var(--muted))]";
    }
    
    if (isToday(date)) {
      baseClass += " bg-[hsl(var(--accent))] ring-2 ring-[hsl(var(--primary))] ring-inset";
    }
    
    if (clickedDate && isSameDay(clickedDate, date)) {
      baseClass += " bg-[hsl(var(--secondary))] ring-1 ring-[hsl(var(--ring))]";
    }
    
    if (dayEvents.length > 0) {
      baseClass += " shadow-sm";
    }
    
    return baseClass.trim();
  };

  // Date number styling
  const getDayNumberClass = (date: Date) => {
    let baseClass = `font-medium ${isMobile ? 'text-sm' : 'text-base'}`;
    
    if (isToday(date)) {
      baseClass += " text-[hsl(var(--primary))] font-bold";
    } else if (!isSameMonth(date, currentDate)) {
      baseClass += " text-[hsl(var(--muted-foreground))]";
    } else {
      baseClass += " text-[hsl(var(--foreground))]";
    }
    
    return baseClass;
  };

  // Event handlers
  const handleDateClick = (date: Date) => {
    // Single responsibility: Just handle date selection and tooltip
    setClickedDate(clickedDate && isSameDay(clickedDate, date) ? null : date);
    setTooltipType('clicked-date');
  };

  const handleEventClick = (event: CalendarEvent, e?: React.MouseEvent) => {
    e?.stopPropagation();
    
    if (event.is_hour_log) {
      // For hour logs, show tooltip
      const eventDate = new Date(event.event_date);
      setClickedDate(clickedDate && isSameDay(clickedDate, eventDate) ? null : eventDate);
      setTooltipType('clicked-event');
    } else {
      // For regular events, trigger edit if possible
      if (permissions.canEditEvents && onEditEvent) {
        onEditEvent(event);
      } else {
        // Otherwise just show tooltip
        const eventDate = new Date(event.event_date);
        setClickedDate(eventDate);
        setTooltipType('clicked-event');
      }
    }
  };

  const handleDateRightClick = (date: Date, dayEvents: CalendarEvent[], e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      date,
      events: dayEvents
    });
  };

  const handleTooltipClose = () => {
    setClickedDate(null);
    setHoveredDate(null);
  };

  const closeContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, date: null, events: [] });
  };

  // Context menu action handlers
  const handleContextAction = (action: string, date?: Date, event?: CalendarEvent) => {
    closeContextMenu();
    
    switch (action) {
      case 'create':
        if (date && permissions.canCreateEvents && onCreateEvent) {
          onCreateEvent(date);
        }
        break;
      case 'logHours':
        if (date && permissions.canLogHours && onLogHours) {
          onLogHours(date);
        }
        break;
      case 'edit':
        if (event && permissions.canEditEvents && onEditEvent) {
          onEditEvent(event);
        }
        break;
      case 'delete':
        if (event && permissions.canDeleteEvents && onDeleteEvent) {
          onDeleteEvent(event);
        }
        break;
    }
  };

  // Close context menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenu.visible) {
        closeContextMenu();
      }
    };

    if (contextMenu.visible) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu.visible]);

  if (loading) {
    return (
      <div className="w-full max-w-full rounded-[var(--radius)] bg-[hsl(var(--background))] shadow-sm">
        <div className="animate-pulse">
          <div className="h-12 bg-[hsl(var(--muted))] rounded-t-[var(--radius)] mb-4"></div>
          <div className="grid grid-cols-7 gap-2 p-4">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-16 bg-[hsl(var(--muted))] rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render calendar grid
  const renderCalendarGrid = () => {
    const weeks = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7));
    }

    return weeks.map((week, weekIndex) => (
      <tr key={weekIndex} className="grid grid-cols-7">
        {week.map((date, dayIndex) => {
          const dayEvents = getEventsForDate(date);
          const maxVisibleEvents = isMobile ? 1 : 3;

          return (
            <td
              key={date.toISOString()}
              className={getCellClass(date, dayEvents)}
              onClick={() => handleDateClick(date)}
              onContextMenu={(e) => handleDateRightClick(date, dayEvents, e)}
              onMouseEnter={() => {
                if (!isMobile) {
                  setHoveredDate(date);
                  setTooltipType('hover');
                }
              }}
              onMouseLeave={() => {
                if (!isMobile) {
                  setHoveredDate(null);
                }
              }}
            >
              {/* Date number */}
              <div className="flex items-center justify-between mb-1">
                <span className={getDayNumberClass(date)}>
                  {format(date, 'd')}
                </span>
                
                {/* Event count indicator for mobile */}
                {isMobile && dayEvents.length > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-full">
                    {dayEvents.length}
                  </span>
                )}
              </div>
              
              {/* Events */}
              <div className={`space-y-1 overflow-hidden ${isMobile ? 'h-8' : 'flex-1'}`}>
                {dayEvents.slice(0, maxVisibleEvents).map((event, index) => (
                  <CalendarEvent
                    key={event.id}
                    event={event}
                    index={index}
                    maxVisible={maxVisibleEvents}
                    onClick={(e) => handleEventClick(event, e)}
                    formatTime={formatTime}
                  />
                ))}
                
                {dayEvents.length > maxVisibleEvents && (
                  <div 
                    className="text-xs text-[hsl(var(--muted-foreground))] cursor-pointer hover:text-[hsl(var(--primary))] font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDateClick(date);
                    }}
                  >
                    +{dayEvents.length - maxVisibleEvents} more
                  </div>
                )}
              </div>

              {/* Hover tooltip (desktop only) */}
              {!isMobile && hoveredDate && isSameDay(hoveredDate, date) && dayEvents.length > 0 && tooltipType === 'hover' && (
                <EventTooltip
                  date={date}
                  events={dayEvents}
                  isVisible={true}
                  onClose={() => setHoveredDate(null)}
                  onEventClick={(event) => handleEventClick(event)}
                  tooltipType="hover"
                  userRole={userRole}
                  parentRef={calendarRef}
                />
              )}
            </td>
          );
        })}
      </tr>
    ));
  };

  return (
    <div 
      ref={calendarRef}
      className="w-full max-w-full rounded-[var(--radius)] bg-[hsl(var(--background))] shadow-sm border border-[hsl(var(--border))] overflow-hidden"
    >
      {/* Header */}
      <div className="bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]">
        <div className="grid grid-cols-7 rounded-t-[var(--radius)]">
          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
            <div
              key={day}
              className={`flex h-12 items-center justify-center p-2 text-sm font-medium ${
                index === 0 ? 'rounded-tl-[var(--radius)]' : ''
              } ${index === 6 ? 'rounded-tr-[var(--radius)]' : ''}`}
            >
              <span className={isMobile ? 'text-xs' : 'hidden lg:block'}>{day}</span>
              <span className={isMobile ? 'hidden' : 'block lg:hidden'}>{day.slice(0, 3)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <table className="w-full">
        <tbody>
          {renderCalendarGrid()}
        </tbody>
      </table>

      {/* Persistent tooltip for clicked dates */}
      {clickedDate && (
        <EventTooltip
          date={clickedDate}
          events={getEventsForDate(clickedDate)}
          isVisible={true}
          onClose={handleTooltipClose}
          onEventClick={(event) => handleEventClick(event)}
          tooltipType={tooltipType}
          userRole={userRole}
          parentRef={calendarRef}
        />
      )}

      {/* Context Menu */}
      {contextMenu.visible && (
        <div
          className="fixed z-50 bg-[hsl(var(--popover))] border border-[hsl(var(--border))] rounded-md shadow-lg py-2 min-w-48"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {permissions.canCreateEvents && (
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-[hsl(var(--muted))] flex items-center space-x-2"
              onClick={() => handleContextAction('create', contextMenu.date)}
            >
              <span>+ Create Event</span>
            </button>
          )}
          
          {permissions.canLogHours && (
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-[hsl(var(--muted))] flex items-center space-x-2"
              onClick={() => handleContextAction('logHours', contextMenu.date)}
            >
              <span>+ Log Hours</span>
            </button>
          )}
          
          {contextMenu.events.length > 0 && (
            <div className="border-t border-[hsl(var(--border))] my-1">
              {contextMenu.events.slice(0, 3).map(event => (
                <div key={event.id} className="px-4 py-2">
                  <div className="text-xs font-medium text-[hsl(var(--muted-foreground))]">{event.title}</div>
                  <div className="flex space-x-2 mt-1">
                    {permissions.canEditEvents && (
                      <button
                        className="text-xs text-blue-600 hover:underline"
                        onClick={() => handleContextAction('edit', undefined, event)}
                      >
                        Edit
                      </button>
                    )}
                    {permissions.canDeleteEvents && (
                      <button
                        className="text-xs text-red-600 hover:underline"
                        onClick={() => handleContextAction('delete', undefined, event)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarBox;