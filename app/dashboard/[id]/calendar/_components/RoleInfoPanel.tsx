// app/dashboard/[id]/calendar/_components/RoleInfoPanel.tsx
'use client';

import { Users } from 'lucide-react';

interface RoleInfoPanelProps {
  userRole: string;
}

export default function RoleInfoPanel({ userRole }: RoleInfoPanelProps) {
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

  // Get role-specific instructions
  const getRoleInstructions = (role: string) => {
    switch (role) {
      case 'admin1': 
        return 'You can create, edit and delete all calendar events. Click dates to create events.';
      case 'coachx7': 
        return 'Click any date to log your work hours (try "TB 7" for quick entry). Your logged hours appear as green calendar events.';
      case 'client7x': 
        return 'You can view your scheduled appointments and meetings.';
      case 'user0x': 
        return 'Basic user - limited calendar access.';
      default: 
        return 'Unknown role - no calendar access.';
    }
  };

  return (
    <div className="mb-4 p-4 bg-[hsl(var(--muted))] rounded-lg border border-[hsl(var(--border))]">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4" />
        <span className="text-sm font-medium">
          Viewing as: {getRoleDisplayName(userRole)}
        </span>
      </div>
      <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
        {getRoleInstructions(userRole)}
      </div>
    </div>
  );
}