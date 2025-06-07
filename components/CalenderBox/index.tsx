// components/CalenderBox/index.tsx (Enhanced)
'use client';

import { useMemo, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';

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
}

interface CalendarBoxProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  viewMode: 'month' | 'week' | 'day';
}

const CalendarBox = ({ 
  currentDate, 
  events, 
  onDateClick, 
  onEventClick, 
  viewMode 
}: CalendarBoxProps) => {
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

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

  // Handle empty events gracefully
  if (!events || events.length === 0) {
    console.log('No events to display, rendering empty calendar');
  }

  // Format time for display
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
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

  // Render event in calendar cell
  const renderEvent = (event: CalendarEvent, index: number) => {
    const maxVisibleEvents = 3;
    
    if (index >= maxVisibleEvents) {
      return null;
    }
    
    return (
      <div
        key={event.id}
        className="mb-1 cursor-pointer rounded-sm px-1 py-0.5 text-xs font-medium text-white truncate"
        style={{ backgroundColor: event.color_code }}
        onClick={(e) => {
          e.stopPropagation();
          onEventClick(event);
        }}
        title={`${event.title} - ${formatTime(event.start_time)} to ${formatTime(event.end_time)}`}
      >
        <span className="block truncate">
          {formatTime(event.start_time)} {event.title}
        </span>
      </div>
    );
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

          return (
            <td
              key={date.toISOString()}
              className={cellClass}
              onClick={() => onDateClick(date)}
              onMouseEnter={() => setHoveredDate(date)}
              onMouseLeave={() => setHoveredDate(null)}
            >
              <span className={getDayNumberClass(date)}>
                {format(date, 'd')}
              </span>
              
              <div className="mt-1 space-y-1 overflow-hidden">
                {dayEvents.slice(0, 3).map((event, index) => renderEvent(event, index))}
                
                {dayEvents.length > 3 && (
                  <div className="text-xs text-[hsl(var(--muted-foreground))] cursor-pointer hover:text-[hsl(var(--primary))]">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>

              {/* Hover tooltip for more event details */}
              {hoveredDate && isSameDay(hoveredDate, date) && dayEvents.length > 0 && (
                <div className="absolute left-full top-0 z-50 ml-2 w-64 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 shadow-lg">
                  <div className="font-medium text-[hsl(var(--card-foreground))] mb-2">
                    {format(date, 'EEEE, MMMM d')}
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-start gap-2 p-2 rounded-sm hover:bg-[hsl(var(--muted))] cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                      >
                        <div
                          className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0"
                          style={{ backgroundColor: event.color_code }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-[hsl(var(--card-foreground))] truncate">
                            {event.title}
                          </div>
                          <div className="text-xs text-[hsl(var(--muted-foreground))]">
                            {formatTime(event.start_time)} - {formatTime(event.end_time)}
                          </div>
                          {event.client_name && (
                            <div className="text-xs text-[hsl(var(--muted-foreground))]">
                              Client: {event.client_name}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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