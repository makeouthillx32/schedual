// components/CalenderBox/CalendarEvent.tsx
'use client';

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
}

interface CalendarEventProps {
  event: CalendarEvent;
  index: number;
  maxVisible: number;
  onClick: (event: CalendarEvent) => void;
  formatTime: (timeString: string, isHourLog?: boolean) => string;
}

const CalendarEvent = ({
  event,
  index,
  maxVisible,
  onClick,
  formatTime
}: CalendarEventProps) => {
  if (index >= maxVisible) {
    return null;
  }

  // Get event display text based on type
  const getEventDisplayText = () => {
    if (event.is_hour_log) {
      return event.title; // e.g., "TB 7"
    }
    
    if (event.is_payday) {
      return `💰 ${event.title}`;
    }
    
    if (event.is_holiday) {
      return `🎉 ${event.title}`;
    }
    
    if (event.is_sales_day) {
      return `🛍️ ${event.title}`;
    }
    
    // Regular events with time
    const timeText = formatTime(event.start_time, false);
    return timeText ? `${timeText} ${event.title}` : event.title;
  };

  // Get tooltip text
  const getTooltipText = () => {
    if (event.is_hour_log) {
      return event.description || event.title;
    }
    
    if (event.is_payday && event.amount) {
      return `${event.title} - $${event.amount.toLocaleString()}`;
    }
    
    if (event.is_holiday) {
      return `${event.title} - Holiday`;
    }
    
    if (event.is_sales_day) {
      return `${event.title} - Sales Event`;
    }
    
    // Regular events
    const startTime = formatTime(event.start_time, false);
    const endTime = formatTime(event.end_time, false);
    
    if (startTime && endTime) {
      return `${event.title} - ${startTime} to ${endTime}`;
    }
    
    return event.title;
  };

  // Get background styling based on event type
  const getEventStyling = () => {
    if (event.is_payday) {
      return {
        backgroundColor: '#f59e0b', // Gold/amber
        backgroundImage: 'linear-gradient(45deg, #f59e0b 0%, #eab308 100%)',
        borderLeft: '3px solid #d97706'
      };
    }
    
    if (event.is_holiday) {
      return {
        backgroundColor: '#ef4444', // Red
        backgroundImage: 'linear-gradient(45deg, #ef4444 0%, #dc2626 100%)',
        borderLeft: '3px solid #b91c1c'
      };
    }
    
    if (event.is_sales_day) {
      return {
        backgroundColor: '#8b5cf6', // Purple
        backgroundImage: 'linear-gradient(45deg, #8b5cf6 0%, #7c3aed 100%)',
        borderLeft: '3px solid #6d28d9'
      };
    }
    
    if (event.is_hour_log) {
      return {
        backgroundColor: event.color_code,
        borderLeft: '3px solid #059669'
      };
    }
    
    // Regular events with priority indicators
    const baseStyle = { backgroundColor: event.color_code };
    
    if (event.priority === 'urgent') {
      return {
        ...baseStyle,
        borderLeft: '3px solid #dc2626',
        animation: 'pulse 2s infinite'
      };
    }
    
    if (event.priority === 'high') {
      return {
        ...baseStyle,
        borderLeft: '3px solid #f59e0b'
      };
    }
    
    return baseStyle;
  };

  // Get additional CSS classes
  const getEventClasses = () => {
    let classes = "mb-1 cursor-pointer rounded-sm px-1 py-0.5 text-xs font-medium text-white truncate transition-all duration-200 hover:scale-105 hover:shadow-md";
    
    if (event.priority === 'urgent') {
      classes += ' animate-pulse';
    }
    
    if (event.is_payday || event.is_holiday || event.is_sales_day) {
      classes += ' font-bold shadow-sm';
    }
    
    return classes;
  };

  return (
    <div
      className={getEventClasses()}
      style={getEventStyling()}
      onClick={(e) => {
        e.stopPropagation();
        onClick(event);
      }}
      title={getTooltipText()}
    >
      <span className="block truncate">
        {getEventDisplayText()}
      </span>
      
      {/* Priority indicator for urgent events */}
      {event.priority === 'urgent' && (
        <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
      )}
    </div>
  );
};

export default CalendarEvent;