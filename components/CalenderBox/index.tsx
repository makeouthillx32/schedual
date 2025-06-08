// components/CalenderBox/index.tsx (Updated to use modular components)
'use client';

import { useMemo, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
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
  is_payday?: boolean;
  is_holiday?: boolean;
  is_sales_day?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  location?: string;
  amount?: number;
  holiday_type?: string;
}

interface CalendarBoxProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  viewMode: 'month' | 'week' | 'day';
  userRole?: string;
}

const CalendarBox = ({ 
  currentDate, 
  events, 
  onDateClick, 
  onEventClick, 
  viewMode,
  userRole = 'user'
}: CalendarBoxProps) => {
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [clickedDate, setClickedDate] = useState<Date | null>(null);
  const [tooltipType, setTooltipType] = useState<'hover' | 'clicked-date' | 'clicked-event'>('hover');

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    
    // Get the first day of the week for the start of month
    const startDate = new Date(start);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    // Get the last day of the week for the end of month
    const endDate = new Date(end);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentDate]);

  // Group events by date
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
  const formatTime = (timeString: string, isHourLog: boolean = false) => {
    if (isHourLog || timeString === 'All Day' || !timeString || timeString.trim() === '') {
      return '';
    }
    
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      
      if (isNaN(hour) || hour < 0 || hour > 23) {
        return '';
      }
      
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch (error) {
      console.warn('Error formatting time:', timeString, error);
      return '';
    }
  };

  // Common cell styling with CSS variables
  const getCellClass = (date: Date) => {
    const baseClass = "ease relative h-20 cursor-pointer border border-[hsl(var(--border))] p-2 transition duration-500 hover:bg-[hsl(var(--muted))] dark:border-[hsl(var(--sidebar-border))] dark:hover:bg-[hsl(var(--secondary))] md:h-25 md:p-6 xl:h-31";
    
    if (!isSameMonth(date, currentDate)) {
      return baseClass + " opacity-50";
    }
    
    if (isToday(date)) {
      return baseClass + " bg-[hsl(var(--accent))] ring-2 ring-[hsl(var(--primary))]";
    }
    
    return baseClass;
  };

  // Common text styling
  const getDayNumberClass = (date: Date) => {
    let baseClass = "font-medium";
    
    if (isToday(date)) {
      baseClass += " text-[hsl(var(--primary))] font-bold";
    } else if (!isSameMonth(date, currentDate)) {
      baseClass += " text-[hsl(var(--muted-foreground))]";
    } else {
      baseClass += " text-[hsl(var(--foreground))] dark:text-[hsl(var(--card-foreground))]";
    }
    
    return baseClass;
  };

  // Handle event click with enhanced logic
  const handleEventClick = (event: CalendarEvent) => {
    if (event.is_hour_log) {
      // For hour logs, show persistent tooltip
      const eventDate = new Date(event.event_date);
      setClickedDate(clickedDate && isSameDay(clickedDate, eventDate) ? null : eventDate);
      setTooltipType('clicked-event');
    } else {
      // For regular events, use the original handler
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
  };

  // Render calendar grid in weeks
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
          
          let cellClass = getCellClass(date);
          if (isFirstDay) cellClass += " rounded-bl-[var(--radius)]";
          if (isLastDay) cellClass += " rounded-br-[var(--radius)]";

          const maxVisibleEvents = 3;

          return (
            <td
              key={date.toISOString()}
              className={cellClass}
              onClick={() => handleDateClick(date)}
              onMouseEnter={() => {
                setHoveredDate(date);
                setTooltipType('hover');
              }}
              onMouseLeave={() => setHoveredDate(null)}
            >
              <span className={getDayNumberClass(date)}>
                {format(date, 'd')}
              </span>
              
              <div className="mt-1 space-y-1 overflow-hidden">
                {dayEvents.slice(0, maxVisibleEvents).map((event, index) => (
                  <CalendarEvent
                    key={event.id}
                    event={event}
                    index={index}
                    maxVisible={maxVisibleEvents}
                    onClick={handleEventClick}
                    formatTime={formatTime}
                  />
                ))}
                
                {dayEvents.length > maxVisibleEvents && (
                  <div className="text-xs text-[hsl(var(--muted-foreground))] cursor-pointer hover:text-[hsl(var(--primary))]">
                    +{dayEvents.length - maxVisibleEvents} more
                  </div>
                )}
              </div>

              {/* Hover tooltip */}
              {hoveredDate && isSameDay(hoveredDate, date) && dayEvents.length > 0 && tooltipType === 'hover' && (
                <EventTooltip
                  date={date}
                  events={dayEvents}
                  isVisible={true}
                  onClose={() => setHoveredDate(null)}
                  onEventClick={onEventClick}
                  tooltipType="hover"
                  userRole={userRole}
                />
              )}

              {/* Persistent tooltip for clicked dates */}
              {clickedDate && isSameDay(clickedDate, date) && dayEvents.length > 0 && tooltipType !== 'hover' && (
                <EventTooltip
                  date={date}
                  events={dayEvents}
                  isVisible={true}
                  onClose={handleTooltipClose}
                  onEventClick={handleEventClick}
                  tooltipType={tooltipType}
                  userRole={userRole}
                />
              )}
            </td>
          );
        })}
      </tr>
    ));
  };

  return (
    <div className="w-full max-w-full rounded-[var(--radius)] bg-[hsl(var(--background))] shadow-[var(--shadow-sm)] dark:bg-[hsl(var(--card))] dark:shadow-[var(--shadow-md)]">
      <table className="w-full">
        <thead>
          <tr className="grid grid-cols-7 rounded-t-[var(--radius)] bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
              <th
                key={day}
                className={`flex h-15 items-center justify-center p-1 text-body-xs font-medium sm:text-base xl:p-5 ${
                  index === 0 ? 'rounded-tl-[var(--radius)]' : ''
                } ${index === 6 ? 'rounded-tr-[var(--radius)]' : ''}`}
              >
                <span className="hidden lg:block">{day}</span>
                <span className="block lg:hidden">{day.slice(0, 3)}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {renderCalendarGrid()}
        </tbody>
      </table>
    </div>
  );
};

export default CalendarBox;