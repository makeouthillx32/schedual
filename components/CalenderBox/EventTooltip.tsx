// components/CalenderBox/EventTooltip.tsx - Updated for database event types and SLS support
'use client';

import { format } from 'date-fns';
import { useState, useEffect } from 'react';

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

interface EventTooltipProps {
  date: Date;
  events: CalendarEvent[];
  isVisible: boolean;
  onClose: () => void;
  onEventClick: (event: CalendarEvent) => void;
  tooltipType: 'hover' | 'clicked-date' | 'clicked-event';
  userRole?: string;
}

interface EventType {
  id: string;
  name: string;
  description: string;
  color_code: string;
  is_active: boolean;
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
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch event types from database
  useEffect(() => {
    const fetchEventTypes = async () => {
      try {
        const response = await fetch('/api/calendar/event-types', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const types = await response.json();
          setEventTypes(types);
        } else {
          console.warn('Failed to load event types');
        }
      } catch (error) {
        console.error('Error loading event types:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isVisible) {
      fetchEventTypes();
    }
  }, [isVisible]);

  if (!isVisible || events.length === 0 || loading) return null;

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

  // Get event type icon based on database event type
  const getEventTypeIcon = (event: CalendarEvent) => {
    if (event.is_hour_log) return '⏰';
    
    const eventType = eventTypes.find(type => 
      type.name.toLowerCase() === event.event_type.toLowerCase()
    );
    
    if (!eventType) return '📌';
    
    switch (eventType.name.toLowerCase()) {
      case 'payday': return '💰';
      case 'holiday': return '🎉';
      case 'sls event': return '🏠';
      case 'meeting': return '👥';
      case 'appointment': return '📅';
      case 'training': return '🎓';
      case 'workshop': return '🛠️';
      case 'assessment': return '📊';
      case 'interview': return '💼';
      case 'follow-up': return '📞';
      case 'job coach meeting': return '🎯';
      case 'personal': return '👤';
      default: return '📌';
    }
  };

  // Helper to check if event is special type from database
  const isSpecialEventType = (event: CalendarEvent) => {
    const eventType = eventTypes.find(type => 
      type.name.toLowerCase() === event.event_type.toLowerCase()
    );
    
    return eventType?.name.toLowerCase() === 'payday' || 
           eventType?.name.toLowerCase() === 'holiday';
  };

  // Helper to check if event is SLS type from database
  const isSlsEventType = (event: CalendarEvent) => {
    const eventType = eventTypes.find(type => 
      type.name.toLowerCase() === event.event_type.toLowerCase()
    );
    
    return eventType?.name.toLowerCase() === 'sls event';
  };

  // Sort events by priority and type
  const sortedEvents = [...events].sort((a, b) => {
    // Special events first
    if (isSpecialEventType(a) && !isSpecialEventType(b)) return -1;
    if (isSpecialEventType(b) && !isSpecialEventType(a)) return 1;
    
    // Then by priority
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2;
    const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2;
    
    return aPriority - bPriority;
  });

  // Group events by type for better organization
  const groupedEvents = {
    special: sortedEvents.filter(e => isSpecialEventType(e)),
    hourLogs: sortedEvents.filter(e => e.is_hour_log),
    slsEvents: sortedEvents.filter(e => isSlsEventType(e)),
    regular: sortedEvents.filter(e => !isSpecialEventType(e) && !e.is_hour_log && !isSlsEventType(e))
  };

  // Render special event (payday, holiday from database)
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
        <div className="text-xs text-purple-600 mt-1">
          {event.event_type}
        </div>
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

  // Render SLS event with client name emphasis
  const renderSlsEvent = (event: CalendarEvent) => (
    <div
      key={event.id}
      className="flex items-start gap-2 p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 cursor-pointer hover:shadow-md transition-shadow"
      onClick={(e) => {
        e.stopPropagation();
        onEventClick(event);
      }}
    >
      <div className="text-2xl mt-0.5 flex-shrink-0">🏠</div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm text-green-800 truncate">
          {event.title.replace(/^SLS:\s*/i, '')}
        </div>
        <div className="text-xs text-green-600 mt-1">
          {formatTime(event.start_time, false)} - {formatTime(event.end_time, false)}
        </div>
        {/* ENHANCED: Show client name prominently for SLS events */}
        {event.client_name && (
          <div className="text-xs text-blue-700 font-semibold mt-1 bg-blue-50 px-2 py-1 rounded">
            👤 Client: {event.client_name}
          </div>
        )}
        {event.coach_name && (
          <div className="text-xs text-purple-600 mt-1">
            🎯 Coach: {event.coach_name}
          </div>
        )}
        {event.location && (
          <div className="text-xs text-gray-600 mt-1">
            📍 {event.location}
          </div>
        )}
        {event.description && (
          <div className="text-xs text-green-600 mt-1">
            {event.description}
          </div>
        )}
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
        {/* ENHANCED: Show both client and coach names prominently */}
        {event.client_name && (
          <div className="text-xs text-blue-600 font-medium">
            👤 Client: {event.client_name}
          </div>
        )}
        {event.coach_name && (
          <div className="text-xs text-green-600">
            🎯 Coach: {event.coach_name}
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
    slsEventCount: groupedEvents.slsEvents.length,
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
            {dayStats.slsEventCount > 0 && ` • ${dayStats.slsEventCount} SLS`}
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

        {/* SLS Events Section */}
        {groupedEvents.slsEvents.length > 0 && (
          <div>
            <div className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-2 uppercase tracking-wide">
              SLS Events
            </div>
            <div className="space-y-2">
              {groupedEvents.slsEvents.map(renderSlsEvent)}
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
                <>
                  <button className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors">
                    + Add Holiday
                  </button>
                  <button className="px-3 py-1 text-xs bg-emerald-100 text-emerald-700 rounded-full hover:bg-emerald-200 transition-colors">
                    + SLS Event
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventTooltip;