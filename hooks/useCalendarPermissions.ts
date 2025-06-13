// hooks/useCalendarPermissions.ts
import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface CalendarPermissions {
  canCreateEvents: boolean;
  canEditEvents: boolean;
  canDeleteEvents: boolean;
  canLogHours: boolean;
  canViewAllEvents: boolean;
  canManageUsers: boolean;
  canExportData: boolean;
  canCreateSLS: boolean;
  canManageCalendar: boolean;
}

interface PermissionRecord {
  permission_type: string;
  resource_type: string;
  permission_level: string;
  specific_actions: string[];
  metadata: any;
}

export function useCalendarPermissions(userId: string | null, userRole: string | null) {
  const [permissions, setPermissions] = useState<CalendarPermissions>({
    canCreateEvents: false,
    canEditEvents: false,
    canDeleteEvents: false,
    canLogHours: false,
    canViewAllEvents: false,
    canManageUsers: false,
    canExportData: false,
    canCreateSLS: false,
    canManageCalendar: false,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Map role IDs correctly - these should match your actual database role IDs
  const getRoleType = (roleId: string): string => {
    // Now we use the role IDs directly since that's what the database expects
    switch (roleId) {
      case 'admin1': return 'admin1';
      case 'coachx7': return 'coachx7'; 
      case 'client7x': return 'client7x';
      case 'user0x': return 'user0x';
      default: return 'user0x';
    }
  };

  // Fetch permissions from database
  const fetchPermissions = async () => {
    if (!userId || !userRole) {
      console.log('[Permissions] No user ID or role provided');
      setPermissions({
        canCreateEvents: false,
        canEditEvents: false,
        canDeleteEvents: false,
        canLogHours: false,
        canViewAllEvents: false,
        canManageUsers: false,
        canExportData: false,
        canCreateSLS: false,
        canManageCalendar: false,
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const roleType = getRoleType(userRole);
      console.log('[Permissions] Fetching permissions for user:', userId, 'role:', userRole, 'type:', roleType);

      // Call the database function to get user permissions
      const { data: userPermissions, error: permError } = await supabase
        .rpc('get_user_permissions', {
          user_uuid: userId,
          user_role_type: roleType
        });

      if (permError) {
        console.error('[Permissions] Error fetching user-specific permissions:', permError);
        
        // Fallback to role-based permissions
        const { data: rolePermissions, error: roleError } = await supabase
          .from('calendar_permissions')
          .select('permission_type, resource_type, permission_level, specific_actions, metadata')
          .eq('shared_with_type', roleType)
          .eq('permission_type', 'role_based')
          .eq('is_active', true);

        if (roleError) {
          throw new Error(`Failed to fetch permissions: ${roleError.message}`);
        }

        console.log('[Permissions] Using role-based fallback permissions:', rolePermissions);
        parsePermissions(rolePermissions || []);
      } else {
        console.log('[Permissions] Fetched user permissions:', userPermissions);
        parsePermissions(userPermissions || []);
      }

    } catch (err) {
      console.error('[Permissions] Error in fetchPermissions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch permissions');
      
      // Fallback to hardcoded permissions based on role
      setFallbackPermissions(userRole);
    } finally {
      setLoading(false);
    }
  };

  // Parse permission records into boolean flags
  const parsePermissions = (permissionRecords: PermissionRecord[]) => {
    const newPermissions: CalendarPermissions = {
      canCreateEvents: false,
      canEditEvents: false,
      canDeleteEvents: false,
      canLogHours: false,
      canViewAllEvents: false,
      canManageUsers: false,
      canExportData: false,
      canCreateSLS: false,
      canManageCalendar: false,
    };

    permissionRecords.forEach(perm => {
      // Check permission level
      const hasAdminLevel = perm.permission_level === 'admin';
      const hasWriteLevel = perm.permission_level === 'write' || hasAdminLevel;
      
      // Check specific actions
      const actions = perm.specific_actions || [];
      
      // Map permissions
      if (hasAdminLevel || actions.includes('create_events') || perm.permission_level === 'create_events') {
        newPermissions.canCreateEvents = true;
      }
      
      if (hasAdminLevel || actions.includes('edit_events') || perm.permission_level === 'edit_events') {
        newPermissions.canEditEvents = true;
      }
      
      if (hasAdminLevel || actions.includes('delete_events') || perm.permission_level === 'delete_events') {
        newPermissions.canDeleteEvents = true;
      }
      
      if (hasAdminLevel || actions.includes('log_hours') || perm.permission_level === 'log_hours') {
        newPermissions.canLogHours = true;
      }
      
      if (hasAdminLevel || actions.includes('view_all_events') || perm.permission_level === 'view_all_events') {
        newPermissions.canViewAllEvents = true;
      }
      
      if (hasAdminLevel || actions.includes('manage_users') || perm.permission_level === 'manage_users') {
        newPermissions.canManageUsers = true;
      }
      
      if (hasAdminLevel || actions.includes('export_data') || perm.permission_level === 'export_data') {
        newPermissions.canExportData = true;
      }
      
      if (hasAdminLevel || actions.includes('sls_create') || perm.permission_level === 'sls_create') {
        newPermissions.canCreateSLS = true;
      }
      
      if (hasAdminLevel || actions.includes('calendar_manage') || perm.permission_level === 'calendar_manage') {
        newPermissions.canManageCalendar = true;
      }
    });

    console.log('[Permissions] Parsed permissions:', newPermissions);
    setPermissions(newPermissions);
  };

  // Fallback to hardcoded permissions if database fails
  const setFallbackPermissions = (role: string) => {
    console.log('[Permissions] Using fallback permissions for role:', role);
    
    switch (role) {
      case 'admin1':
        setPermissions({
          canCreateEvents: true,
          canEditEvents: true,
          canDeleteEvents: true,
          canLogHours: true,
          canViewAllEvents: true,
          canManageUsers: true,
          canExportData: true,
          canCreateSLS: true,
          canManageCalendar: true,
        });
        break;
        
      case 'coachx7':
        setPermissions({
          canCreateEvents: false,
          canEditEvents: false,
          canDeleteEvents: false,
          canLogHours: true,
          canViewAllEvents: false,
          canManageUsers: false,
          canExportData: true,
          canCreateSLS: false,
          canManageCalendar: false,
        });
        break;
        
      case 'client7x':
        setPermissions({
          canCreateEvents: false,
          canEditEvents: false,
          canDeleteEvents: false,
          canLogHours: false,
          canViewAllEvents: false,
          canManageUsers: false,
          canExportData: true, // 🔥 FIXED: Changed from false to true - Clients can now export their calendar data
          canCreateSLS: false,
          canManageCalendar: false,
        });
        break;
        
      default:
        setPermissions({
          canCreateEvents: false,
          canEditEvents: false,
          canDeleteEvents: false,
          canLogHours: false,
          canViewAllEvents: false,
          canManageUsers: false,
          canExportData: false,
          canCreateSLS: false,
          canManageCalendar: false,
        });
        break;
    }
  };

  // Fetch permissions when user or role changes
  useEffect(() => {
    fetchPermissions();
  }, [userId, userRole]);

  // Helper function to check specific permission
  const hasPermission = (permission: keyof CalendarPermissions): boolean => {
    return permissions[permission];
  };

  // Helper function to check multiple permissions (requires all)
  const hasAllPermissions = (...permissionKeys: (keyof CalendarPermissions)[]): boolean => {
    return permissionKeys.every(key => permissions[key]);
  };

  // Helper function to check multiple permissions (requires any)
  const hasAnyPermission = (...permissionKeys: (keyof CalendarPermissions)[]): boolean => {
    return permissionKeys.some(key => permissions[key]);
  };

  return {
    permissions,
    loading,
    error,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    refetch: fetchPermissions
  };
}