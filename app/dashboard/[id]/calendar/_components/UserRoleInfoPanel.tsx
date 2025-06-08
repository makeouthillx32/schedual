// app/dashboard/[id]/calendar/_components/UserRoleInfoPanel.tsx
'use client';

interface UserRoleInfoPanelProps {
  userRole: string;
  roleLoading: boolean;
  selectedUser?: {
    id: string;
    email: string;
    display_name?: string;
    role: string;
    department?: string;
    specialization?: string;
  } | null;
}

const UserRoleInfoPanel = ({ userRole, roleLoading, selectedUser }: UserRoleInfoPanelProps) => {
  // Helper function to get role display name
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin1': return 'Administrator';
      case 'coachx7': return 'Job Coach';
      case 'client7x': return 'Client';
      case 'user0x': return 'Basic User';
      default: return 'User';
    }
  };

  // Helper function to get role description
  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin1': 
        return 'You can create, edit and delete all calendar events. Export all user data for reporting. Click dates to create events.';
      case 'coachx7': 
        return 'Click any date to log your work hours (try "TB 7" for quick entry). Export your calendar data for personal records. Your logged hours appear as green "TB X" events on the calendar.';
      case 'client7x': 
        return 'You can view your scheduled appointments and meetings. Coach hour logs appear for transparency.';
      case 'user0x': 
        return 'Basic user - limited calendar access.';
      default: 
        return 'Unknown role - no calendar access.';
    }
  };

  // Helper function to get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin1': 
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case 'coachx7': 
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12,6 12,12 16,14"></polyline>
          </svg>
        );
      case 'client7x': 
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
          </svg>
        );
      default: 
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        );
    }
  };

  // Helper function to get role color theme
  const getRoleColorTheme = (role: string) => {
    switch (role) {
      case 'admin1': 
        return 'bg-red-50 border-red-200 text-red-800';
      case 'coachx7': 
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'client7x': 
        return 'bg-green-50 border-green-200 text-green-800';
      case 'user0x': 
        return 'bg-gray-50 border-gray-200 text-gray-800';
      default: 
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    }
  };

  return (
    <div className={`mb-4 p-4 rounded-lg border ${getRoleColorTheme(userRole)}`}>
      <div className="flex items-center gap-2">
        {getRoleIcon(userRole)}
        <span className="text-sm font-medium">
          {selectedUser ? (
            <>
              Viewing: {selectedUser.display_name || selectedUser.email} 
              <span className="text-xs opacity-75">
                ({getRoleDisplayName(selectedUser.role)})
              </span>
            </>
          ) : (
            <>
              Viewing as: {getRoleDisplayName(userRole)}
              {roleLoading && ' (Loading role...)'}
            </>
          )}
        </span>
      </div>
      <div className="text-xs mt-1 opacity-90">
        {selectedUser ? (
          <>
            You are viewing <strong>{selectedUser.display_name || selectedUser.email}</strong>'s calendar. 
            {selectedUser.role === 'coachx7' && ' You can see their hour logs and assigned client events.'}
            {selectedUser.role === 'client7x' && ' You can see their scheduled appointments and meetings.'}
            {selectedUser.role === 'admin1' && ' You can see all their administrative calendar entries.'}
          </>
        ) : (
          getRoleDescription(userRole)
        )}
      </div>
    </div>
  );
};

export default UserRoleInfoPanel;