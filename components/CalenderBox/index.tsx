// Enhanced CalendarBox - Better mobile responsiveness and visual improvements
'use client';

import { useState, useEffect, useRef } from 'react';
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
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  userRole: string;
  loading?: boolean;
}

const CalendarBox = ({
  currentDate,
  events = [],
  onDateClick,
  onEventClick,
  userRole,
  loading = false
}: CalendarBoxProps) => {
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [clickedDate, setClickedDate] = useState<Date | null>(null);
  const [tooltipType, setTooltipType] = useState<'hover' | 'clicked-date' | 'clicked-event'>('hover');
  const [isMobile, setIsMobile] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate calendar days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return events.filter(event => event.event_date === dateString);
  };

  // Format time for display
  const formatTime = (timeString: string, isHourLog?: boolean) => {
    if (isHourLog || timeString === 'All Day') return '';
    
    try {
      const [hours, minutes] = timeString.split(':').map(Number);
      const hour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      return `${hour}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    } catch (error) {
      return '';
    }
  };

  // Get cell styling based on date and state
  const getCellClass = (date: Date, dayEvents: CalendarEvent[]) => {
    let baseClass = `
      relative cursor-pointer border border-[hsl(var(--border))] 
      transition-all duration-200 ease-in-out
      hover:bg-[hsl(var(--muted))] hover:shadow-sm
      ${isMobile ? 'h-16 p-1' : 'h-20 p-2 md:h-24 md:p-3 lg:h-28 lg:p-4'}
    `;
    
    // Outside current month
    if (!isSameMonth(date, currentDate)) {
      baseClass += " opacity-50 bg-[hsl(var(--muted))]";
    }
    
    // Today highlighting
    if (isToday(date)) {
      baseClass += " bg-[hsl(var(--accent))] ring-2 ring-[hsl(var(--primary))] ring-inset";
    }
    
    // Clicked date highlighting
    if (clickedDate && isSameDay(clickedDate, date)) {
      baseClass += " bg-[hsl(var(--secondary))] ring-1 ring-[hsl(var(--ring))]";
    }
    
    // Has events indicator
    if (dayEvents.length > 0) {
      baseClass += " shadow-sm";
    }
    
    // Special event types get subtle background hints
    const hasSpecialEvent = dayEvents.some(e => 
      ['holiday', 'payday'].includes(e.event_type.toLowerCase()) ||
      e.priority === 'urgent'
    );
    if (hasSpecialEvent) {
      baseClass += " bg-gradient-to-br from-orange-50 to-transparent";
    }
    
    return baseClass.trim();
  };

  // Get day number styling
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

  // Handle event click
  const handleEventClick = (event: CalendarEvent) => {
    if (event.is_hour_log) {
      const eventDate = new Date(event.event_date);
      setClickedDate(clickedDate && isSameDay(clickedDate, eventDate) ? null : eventDate);
      setTooltipType('clicked-event');
    } else {
      onEventClick(event);
    }
  };

  // Handle date click
  const handleDateClick = (date: Date) => {
    setClickedDate(clickedDate && isSameDay(clickedDate, date) ? null : date);
    setTooltipType('clicked-date');
    onDateClick(date);
  };

  // Handle tooltip close
  const handleTooltipClose = () => {
    setClickedDate(null);
    setHoveredDate(null);
  };

  // Render calendar grid
  const renderCalendarGrid = () => {
    const weeks = [];
    
    for (let i = 0; i < calendarDays.length; i += 7) {
      const week = calendarDays.slice(i, i + 7);
      weeks.push(week);
    }

    return weeks.map((week, weekIndex) => (
      <tr key={weekIndex} className="grid grid-cols-7">
        {week.map((date, dayIndex) => {
          const dayEvents = getEventsForDate(date);
          const isFirstDay = weekIndex === 0 && dayIndex === 0;
          const isLastDay = weekIndex === weeks.length - 1 && dayIndex === 6;
          
          let cellClass = getCellClass(date, dayEvents);
          if (isFirstDay) cellClass += " rounded-bl-[var(--radius)]";
          if (isLastDay) cellClass += " rounded-br-[var(--radius)]";

          // Adjust max visible events based on screen size
          const maxVisibleEvents = isMobile ? 1 : 3;

          return (
            <td
              key={date.toISOString()}
              className={cellClass}
              onClick={() => handleDateClick(date)}
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
                    onClick={handleEventClick}
                    formatTime={formatTime}
                    isMobile={isMobile}
                  />
                ))}
                
                {/* More events indicator */}
                {dayEvents.length > maxVisibleEvents && (
                  <div 
                    className={`text-xs text-[hsl(var(--muted-foreground))] cursor-pointer hover:text-[hsl(var(--primary))] font-medium ${
                      isMobile ? 'text-center' : ''
                    }`}
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
                  onEventClick={onEventClick}
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
          onEventClick={handleEventClick}
          tooltipType={tooltipType}
          userRole={userRole}
          parentRef={calendarRef}
        />
      )}
    </div>
  );
};

export default CalendarBox;