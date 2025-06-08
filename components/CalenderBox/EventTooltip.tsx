// components/CalenderBox/EventTooltip.tsx
'use client';

import { format } from 'date-fns';

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
  amount?: number; // For paydays/sales
  holiday_type?: string; // Federal, State, Company, etc.
}

interface EventTooltipProps {
  date: Date;
  events: CalendarEvent[];
  isVisible: boolean;
  onClose: () => void;
  onEventClick: (event: CalendarEvent) => void;
  tooltipType: 'hover' | 'clicked-date' | 'clicked-event';
  userRole?: string;
}

const EventTooltip = ({
  date,
  events,
  isVisible,
  onClose,
  onEventClick,
  tooltipType,
  userRole = 'user'
}: EventTooltipProps) => {
  if (!isVisible || events.length === 0) return null;

  // Format time for display
  const formatTime = (timeString: string, isHourLog: boolean = false) => {
    if (isHourLog || timeString === 'All Day' || !timeString || timeString.trim() === '') {
      return '';
    }
    
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      
      if (isNaN(hour) || hour < 0 || hour > 23) return '';
      
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch (error) {
      return '';
    }
  };

  // Get priority icon
  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case 'urgent': return '🔥';
      case 'high': return '⚡';
      case 'medium': return '📋';
      case 'low': return '📝';
      default: return '';
    }
  };

  // Get event type icon
  const getEventTypeIcon = (event: CalendarEvent) => {
    if (event.is_payday) return '💰';
    if (event.is_holiday) return '🎉';
    if (event.is_sales_day) return '🛍️';
    if (event.is_hour_log) return '⏰';
    if (event.event_type === 'Meeting') return '👥';
    if (event.event_type === 'Appointment') return '📅';
    if (event.event_type === 'Training') return '🎓';
    return '📌';
  };

  // Sort events by priority and type
  const sortedEvents = [...events].sort((a, b) => {
    // Special events first
    if (a.is_payday && !b.is_payday) return -1;
    if (b.is_payday && !a.is_payday) return 1;
    if (a.is_holiday && !b.is_holiday) return -1;
    if (b.is_holiday && !a.is_holiday) return 1;
    
    // Then by priority
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2;
    const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2;
    
    return aPriority - bPriority;
  });

  // Group events by type for better organization
  const groupedEvents = {
    special: sortedEvents.filter(e => e.is_payday || e.is_holiday || e.is_sales_day),
    hourLogs: sortedEvents.filter(e => e.is_hour_log),
    regular: sortedEvents.filter(e => !e.is_payday && !e.is_holiday && !e.is_sales_day && !e.is_hour_log)
  };

  // Render special event (payday, holiday, sales day)
  const renderSpecialEvent = (event: CalendarEvent) => (
    <div
      key={event.id}
      className="flex items-start gap-2 p-3 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 cursor-pointer hover:shadow-md transition-shadow"
      onClick={(e) => {
        e.stopPropagation();
        onEventClick(event);
      }}
    >
      <div className="text-2xl mt-0.5 flex-shrink-0">
        {getEventTypeIcon(event)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm text-orange-800 truncate">
          {event.title}
        </div>
        {event.description && (
          <div className="text-xs text-orange-600 mt-1">
            {event.description}
          </div>
        )}
        {event.amount && (
          <div className="text-xs text-green-600 font-medium mt-1">
            ${event.amount.toLocaleString()}
          </div>
        )}
        {event.holiday_type && (
          <div className="text-xs text-purple-600 mt-1">
            {event.holiday_type} Holiday
          </div>
        )}
      </div>
    </div>
  );

  // Render hour log event
  const renderHourLogEvent = (event: CalendarEvent) => (
    <div
      key={event.id}
      className="flex items-start gap-2 p-2 rounded-sm bg-green-50 border border-green-200 cursor-pointer hover:bg-green-100 transition-colors"
      onClick={(e) => {
        e.stopPropagation();
        if (tooltipType !== 'clicked-event') {
          onEventClick(event);
        }
      }}
    >
      <div className="text-lg mt-0.5 flex-shrink-0">⏰</div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-green-800 truncate">
          {event.title}
        </div>
        <div className="text-xs text-green-600">
          {event.description}
        </div>
      </div>
    </div>
  );

  // Render regular event
  const renderRegularEvent = (event: CalendarEvent) => (
    <div
      key={event.id}
      className="flex items-start gap-2 p-2 rounded-sm hover:bg-[hsl(var(--muted))] cursor-pointer transition-colors"
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
        <div className="flex items-center gap-1">
          <span className="font-medium text-sm text-[hsl(var(--card-foreground))] truncate">
            {event.title}
          </span>
          {getPriorityIcon(event.priority) && (
            <span className="text-xs">{getPriorityIcon(event.priority)}</span>
          )}
        </div>
        <div className="text-xs text-[hsl(var(--muted-foreground))]">
          {formatTime(event.start_time, false)} - {formatTime(event.end_time, false)}
        </div>
        {event.client_name && (
          <div className="text-xs text-[hsl(var(--muted-foreground))]">
            Client: {event.client_name}
          </div>
        )}
        {event.location && (
          <div className="text-xs text-[hsl(var(--muted-foreground))]">
            📍 {event.location}
          </div>
        )}
      </div>
    </div>
  );

  // Get day summary stats
  const dayStats = {
    totalEvents: events.length,
    totalHours: groupedEvents.hourLogs.reduce((sum, event) => {
      const hours = parseFloat(event.title.split(' ')[1]) || 0;
      return sum + hours;
    }, 0),
    hasSpecialEvents: groupedEvents.special.length > 0,
    urgentEvents: events.filter(e => e.priority === 'urgent').length
  };

  return (
    <div 
      className="absolute left-full top-0 z-50 ml-2 w-80 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
        <div>
          <div className="font-bold text-[hsl(var(--card-foreground))]">
            {format(date, 'EEEE, MMMM d')}
          </div>
          <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
            {dayStats.totalEvents} events
            {dayStats.totalHours > 0 && ` • ${dayStats.totalHours}h logged`}
            {dayStats.urgentEvents > 0 && ` • ${dayStats.urgentEvents} urgent`}
          </div>
        </div>
        {tooltipType !== 'hover' && (
          <button
            onClick={onClose}
            className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] text-lg"
          >
            ✕
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-3 max-h-96 overflow-y-auto">
        {/* Special Events Section */}
        {groupedEvents.special.length > 0 && (
          <div>
            <div className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-2 uppercase tracking-wide">
              Special Events
            </div>
            <div className="space-y-2">
              {groupedEvents.special.map(renderSpecialEvent)}
            </div>
          </div>
        )}

        {/* Hour Logs Section */}
        {groupedEvents.hourLogs.length > 0 && (
          <div>
            <div className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-2 uppercase tracking-wide">
              Time Logs
            </div>
            <div className="space-y-1">
              {groupedEvents.hourLogs.map(renderHourLogEvent)}
            </div>
          </div>
        )}

        {/* Regular Events Section */}
        {groupedEvents.regular.length > 0 && (
          <div>
            <div className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-2 uppercase tracking-wide">
              Scheduled Events
            </div>
            <div className="space-y-1">
              {groupedEvents.regular.map(renderRegularEvent)}
            </div>
          </div>
        )}

        {/* Role-based quick actions */}
        {tooltipType === 'clicked-date' && (
          <div className="pt-3 border-t border-[hsl(var(--border))]">
            <div className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-2 uppercase tracking-wide">
              Quick Actions
            </div>
            <div className="flex gap-2 flex-wrap">
              {userRole === 'coachx7' && (
                <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors">
                  + Log Hours
                </button>
              )}
              {(userRole === 'admin1' || userRole === 'coachx7') && (
                <button className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors">
                  + Schedule Event
                </button>
              )}
              {userRole === 'admin1' && (
                <button className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors">
                  + Add Holiday
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventTooltip;