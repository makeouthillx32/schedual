// app/dashboard/[id]/calendar/_components/CalendarHeader.tsx
'use client';

import { ChevronLeft, ChevronRight, Plus, Clock } from 'lucide-react';

interface CalendarHeaderProps {
  currentDate: Date;
  viewMode: 'month' | 'week' | 'day';
  userRole: string;
  roleLoading: boolean;
  loggingHours: boolean;
  optimisticCount: number;
  permissions: {
    canLogHours: boolean;
    canCreateEvents: boolean;
  };
  onNavigateMonth: (direction: 'prev' | 'next') => void;
  onGoToToday: () => void;
  onSetViewMode: (mode: 'month' | 'week' | 'day') => void;
  onOpenHoursModal: () => void;
  onOpenEventModal: () => void;
}

export default function CalendarHeader({
  currentDate,
  viewMode,
  userRole,
  roleLoading,
  loggingHours,
  optimisticCount,
  permissions,
  onNavigateMonth,
  onGoToToday,
  onSetViewMode,
  onOpenHoursModal,
  onOpenEventModal
}: CalendarHeaderProps) {
  // Format month/year for display
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Convert role to display name
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin1': return 'Administrator';
      case 'coachx7': return 'Job Coach';
      case 'client7x': return 'Client';
      case 'user0x': return 'Basic User';
      default: return 'User';
    }
  };

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
            {formatMonthYear(currentDate)}
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            {getRoleDisplayName(userRole)} View
            {roleLoading && ' (Loading role...)'}
            {/* Show optimistic entries count */}
            {optimisticCount > 0 && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                {optimisticCount} pending
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateMonth('prev')}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => onNavigateMonth('next')}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onGoToToday}
          className="px-4 py-2 text-sm font-medium text-[hsl(var(--foreground))] bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary))]/80 rounded-md transition-colors"
        >
          Today
        </button>
        
        <div className="flex items-center rounded-md border border-[hsl(var(--border))]">
          {(['month', 'week', 'day'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => onSetViewMode(mode)}
              className={`px-3 py-1.5 text-sm font-medium capitalize transition-colors first:rounded-l-md last:rounded-r-md ${
                viewMode === mode
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                  : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Role-based action buttons */}
        <div className="flex items-center gap-2">
          {permissions.canLogHours && (
            <button
              onClick={onOpenHoursModal}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[hsl(var(--secondary-foreground))] bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary))]/80 rounded-md transition-colors"
              title="Log your work hours (supports quick entry like 'TB 7')"
              disabled={loggingHours}
            >
              <Clock className="h-4 w-4" />
              {loggingHours ? 'Logging...' : 'Log Hours'}
            </button>
          )}

          {permissions.canCreateEvents && (
            <button
              onClick={onOpenEventModal}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 rounded-md transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Event
            </button>
          )}
        </div>
      </div>
    </div>
  );
}