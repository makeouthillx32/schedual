// lib/monitors/HallMonitorFactory.ts - FIXED VERSION
import { supabase } from '@/lib/supabaseClient';
import type { 
  MonitorUser, 
  HallMonitor, 
  ContentConfig, 
  AccessContext, 
  AccessResult,
  UserSpecialization 
} from '@/types/monitors';

// Role mapping
const ROLE_MAP: Record<string, string> = {
  'admin1': 'admin',
  'coachx7': 'jobcoach', 
  'user0x': 'user',
  'client7x': 'client'
};

// ✅ BASE MONITOR CLASS - Provides fallback functionality
class BaseMonitor implements HallMonitor {
  constructor(public role_name: string) {}

  async checkAccess(
    userId: string, 
    resource: string, 
    action: string, 
    context?: AccessContext
  ): Promise<AccessResult> {
    // Default deny-all for unknown roles
    return {
      hasAccess: false,
      reason: `Access denied for role: ${this.role_name}`,
      context
    };
  }

  async getContentConfig(userId: string): Promise<ContentConfig> {
    return {
      dashboardLayout: 'user-basic' as any,
      availableFeatures: ['profile-view'],
      primaryActions: [],
      secondaryActions: [],
      navigationItems: [
        { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: 'home' },
        { id: 'profile', label: 'Profile', path: '/profile', icon: 'user' }
      ],
      hiddenSections: [],
      customFields: {},
      visibleComponents: ['header', 'sidebar', 'main-content'],
      permissions: ['profile:read_own']
    };
  }
}

// ✅ CLIENT MONITOR - Specific implementation for client role
class ClientMonitor extends BaseMonitor {
  constructor() {
    super('client');
  }

  async checkAccess(
    userId: string, 
    resource: string, 
    action: string, 
    context?: AccessContext
  ): Promise<AccessResult> {
    // Client permissions
    const clientPermissions = {
      'profile': ['read_own', 'update_own'],
      'calendar_events': ['read_own'],
      'appointments': ['read_own', 'create_own'],
      'messages': ['read_own', 'create_own']
    };

    const resourcePermissions = clientPermissions[resource as keyof typeof clientPermissions] || [];
    const hasAccess = resourcePermissions.includes(action) || resourcePermissions.includes('*');

    return {
      hasAccess,
      reason: hasAccess ? 'Access granted' : `Client role cannot ${action} ${resource}`,
      context
    };
  }

  async getContentConfig(userId: string): Promise<ContentConfig> {
    return {
      dashboardLayout: 'client-dashboard' as any,
      availableFeatures: [
        'profile-view',
        'appointments-view', 
        'calendar-view',
        'messages-view',
        'progress-tracking'
      ],
      primaryActions: [
        { id: 'schedule-appointment', label: 'Schedule Appointment', type: 'button' },
        { id: 'view-progress', label: 'View Progress', type: 'link' }
      ],
      secondaryActions: [
        { id: 'update-profile', label: 'Update Profile', type: 'link' }
      ],
      navigationItems: [
        { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: 'home' },
        { id: 'appointments', label: 'Appointments', path: '/appointments', icon: 'calendar' },
        { id: 'progress', label: 'My Progress', path: '/progress', icon: 'trending-up' },
        { id: 'messages', label: 'Messages', path: '/messages', icon: 'message-circle' },
        { id: 'profile', label: 'Profile', path: '/profile', icon: 'user' }
      ],
      hiddenSections: ['admin-tools', 'coaching-tools', 'analytics'],
      customFields: {
        'client_id': userId,
        'show_progress': true,
        'appointment_booking': true
      },
      visibleComponents: [
        'header', 
        'sidebar', 
        'main-content', 
        'appointment-widget',
        'progress-widget'
      ],
      permissions: [
        'profile:read_own',
        'profile:update_own',
        'calendar_events:read_own',
        'appointments:read_own',
        'appointments:create_own',
        'messages:read_own',
        'messages:create_own'
      ]
    };
  }
}

// ✅ JOBCOACH MONITOR
class JobCoachMonitor extends BaseMonitor {
  constructor() {
    super('jobcoach');
  }

  async checkAccess(
    userId: string, 
    resource: string, 
    action: string, 
    context?: AccessContext
  ): Promise<AccessResult> {
    const coachPermissions = {
      'profile': ['read_own', 'update_own', 'read_assigned_clients'],
      'calendar_events': ['read_own', 'create', 'update_own', 'read_assigned'],
      'coach_daily_reports': ['create', 'read_own', 'update_own'],
      'clients': ['read_assigned', 'update_assigned'],
      'appointments': ['create', 'read_all', 'update_all']
    };

    const resourcePermissions = coachPermissions[resource as keyof typeof coachPermissions] || [];
    const hasAccess = resourcePermissions.includes(action) || resourcePermissions.includes('*');

    return {
      hasAccess,
      reason: hasAccess ? 'Access granted' : `JobCoach role cannot ${action} ${resource}`,
      context
    };
  }

  async getContentConfig(userId: string): Promise<ContentConfig> {
    return {
      dashboardLayout: 'coach-dashboard' as any,
      availableFeatures: [
        'profile-view',
        'client-management',
        'calendar-full',
        'hour-logging',
        'reporting',
        'messages-view'
      ],
      primaryActions: [
        { id: 'log-hours', label: 'Log Hours', type: 'button' },
        { id: 'schedule-client', label: 'Schedule with Client', type: 'button' }
      ],
      secondaryActions: [
        { id: 'view-reports', label: 'View Reports', type: 'link' },
        { id: 'manage-clients', label: 'Manage Clients', type: 'link' }
      ],
      navigationItems: [
        { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: 'home' },
        { id: 'calendar', label: 'Calendar', path: '/calendar', icon: 'calendar' },
        { id: 'clients', label: 'My Clients', path: '/clients', icon: 'users' },
        { id: 'reports', label: 'Reports', path: '/reports', icon: 'file-text' },
        { id: 'messages', label: 'Messages', path: '/messages', icon: 'message-circle' },
        { id: 'profile', label: 'Profile', path: '/profile', icon: 'user' }
      ],
      hiddenSections: ['admin-tools'],
      customFields: {
        'coach_id': userId,
        'hour_logging': true,
        'client_management': true
      },
      visibleComponents: [
        'header',
        'sidebar', 
        'main-content',
        'hour-logging-widget',
        'client-widget',
        'calendar-widget'
      ],
      permissions: [
        'profile:read_own',
        'profile:update_own',
        'calendar_events:create',
        'calendar_events:read_own',
        'calendar_events:update_own',
        'coach_daily_reports:create',
        'coach_daily_reports:read_own',
        'clients:read_assigned',
        'appointments:create',
        'appointments:read_all',
        'messages:read_own',
        'messages:create_own'
      ]
    };
  }
}

// ✅ ADMIN MONITOR
class AdminMonitor extends BaseMonitor {
  constructor() {
    super('admin');
  }

  async checkAccess(): Promise<AccessResult> {
    // Admins have access to everything
    return {
      hasAccess: true,
      reason: 'Admin has full access',
      context: undefined
    };
  }

  async getContentConfig(userId: string): Promise<ContentConfig> {
    return {
      dashboardLayout: 'admin-dashboard' as any,
      availableFeatures: [
        'profile-view',
        'user-management',
        'calendar-admin',
        'reporting-admin',
        'system-settings',
        'analytics',
        'messages-admin'
      ],
      primaryActions: [
        { id: 'manage-users', label: 'Manage Users', type: 'button' },
        { id: 'system-reports', label: 'System Reports', type: 'button' }
      ],
      secondaryActions: [
        { id: 'settings', label: 'Settings', type: 'link' },
        { id: 'analytics', label: 'Analytics', type: 'link' }
      ],
      navigationItems: [
        { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: 'home' },
        { id: 'users', label: 'Users', path: '/users', icon: 'users' },
        { id: 'calendar', label: 'Calendar', path: '/calendar', icon: 'calendar' },
        { id: 'reports', label: 'Reports', path: '/reports', icon: 'file-text' },
        { id: 'analytics', label: 'Analytics', path: '/analytics', icon: 'bar-chart' },
        { id: 'messages', label: 'Messages', path: '/messages', icon: 'message-circle' },
        { id: 'settings', label: 'Settings', path: '/settings', icon: 'settings' }
      ],
      hiddenSections: [],
      customFields: {
        'admin_id': userId,
        'full_access': true
      },
      visibleComponents: [
        'header',
        'sidebar',
        'main-content', 
        'admin-widgets',
        'user-management',
        'system-status'
      ],
      permissions: ['*'] // Full access
    };
  }
}

// ✅ MONITOR FACTORY WITH PROPER ERROR HANDLING
class HallMonitorFactory {
  private static instance: HallMonitorFactory;
  private userCache = new Map<string, { user: MonitorUser; monitor: HallMonitor; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  static getInstance(): HallMonitorFactory {
    if (!HallMonitorFactory.instance) {
      HallMonitorFactory.instance = new HallMonitorFactory();
    }
    return HallMonitorFactory.instance;
  }

  // ✅ MAIN METHOD - Fixed with proper error handling
  async getMonitorForUser(userId: string): Promise<{ user: MonitorUser; monitor: HallMonitor }> {
    try {
      console.log(`[HallMonitorFactory] 🚀 Starting getMonitorForUser for: ${userId}`);

      // Check cache first
      const cached = this.userCache.get(userId);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        console.log(`[HallMonitorFactory] 💾 Using cached data for user: ${userId}`);
        return { user: cached.user, monitor: cached.monitor };
      }

      // Build user data
      console.log(`[HallMonitorFactory] 👤 Building user data for: ${userId}`);
      const user = await this.buildUserData(userId);
      
      if (!user) {
        throw new Error(`Failed to build user data for: ${userId}`);
      }

      console.log(`[HallMonitorFactory] ✅ User data built for role: ${user.role_name}`);

      // Get monitor for role
      console.log(`[HallMonitorFactory] 🎭 Getting monitor for role: ${user.role_name}`);
      const monitor = this.getMonitorForRole(user.role_name);

      console.log(`[HallMonitorFactory] ✅ Monitor created for role: ${user.role_name}`);

      // Cache the result
      this.userCache.set(userId, {
        user,
        monitor,
        timestamp: Date.now()
      });

      console.log(`[HallMonitorFactory] 🎉 Successfully completed getMonitorForUser for: ${userId}`);

      return { user, monitor };

    } catch (error) {
      console.error(`[HallMonitorFactory] ❌ Error in getMonitorForUser:`, error);
      
      // Return fallback user and monitor instead of throwing
      const fallbackUser: MonitorUser = {
        id: userId,
        role_id: 'user0x',
        role_name: 'user',
        email: 'unknown@example.com',
        specializations: []
      };

      const fallbackMonitor = new BaseMonitor('user');

      console.log(`[HallMonitorFactory] 🔄 Returning fallback monitor for user: ${userId}`);
      
      return { user: fallbackUser, monitor: fallbackMonitor };
    }
  }

  // ✅ GET MONITOR FOR ROLE - Fixed with all role implementations
  private getMonitorForRole(roleName: string): HallMonitor {
    console.log(`[HallMonitorFactory] 🏭 Creating monitor for role: ${roleName}`);

    switch (roleName.toLowerCase()) {
      case 'admin':
        return new AdminMonitor();
      
      case 'jobcoach':
        return new JobCoachMonitor();
      
      case 'client':
        console.log(`[HallMonitorFactory] ✅ Creating ClientMonitor`);
        return new ClientMonitor();
      
      case 'user':
      default:
        console.log(`[HallMonitorFactory] ⚠️ Unknown role: ${roleName}, using BaseMonitor`);
        return new BaseMonitor(roleName);
    }
  }

  // ✅ BUILD USER DATA - Enhanced error handling
  private async buildUserData(userId: string): Promise<MonitorUser | null> {
    try {
      console.log(`[HallMonitorFactory] 📋 Step 1: Fetching profile for user ${userId}`);

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, email, display_name')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error(`[HallMonitorFactory] ❌ Profile fetch error:`, profileError);
        return null;
      }

      if (!profile) {
        console.error(`[HallMonitorFactory] ❌ No profile found for user: ${userId}`);
        return null;
      }

      console.log(`[HallMonitorFactory] ✅ Profile fetched: roleId=${profile.role}`);

      // Resolve role name
      const roleName = ROLE_MAP[profile.role] || 'user';
      console.log(`[HallMonitorFactory] 🎯 Resolved role for ${userId}: ID="${profile.role}" -> NAME="${roleName}"`);

      // Get email - try from profile first, then auth
      let email = profile.email;
      if (!email) {
        console.log(`[HallMonitorFactory] 📧 No email in profile, fetching from auth...`);
        const { data: authData } = await supabase.auth.getUser();
        email = authData.user?.email || 'unknown@example.com';
      }
      console.log(`[HallMonitorFactory] 📧 Email retrieved for current user: ${email}`);

      // Get specializations (with error handling)
      console.log(`[HallMonitorFactory] 🎨 Step 4: Fetching specializations for user ${userId}`);
      let specializations: UserSpecialization[] = [];
      
      try {
        const { data: specializationData, error: specializationError } = await supabase
          .from('user_specializations')
          .select(`
            specialization_id,
            specializations(id, name, description)
          `)
          .eq('user_id', userId);

        if (specializationError) {
          console.warn(`[HallMonitorFactory] ⚠️ Specialization fetch warning:`, specializationError);
        } else if (specializationData) {
          specializations = specializationData
            .filter(item => item.specializations)
            .map(item => ({
              id: item.specializations.id,
              name: item.specializations.name,
              description: item.specializations.description || ''
            }));
        }
      } catch (specError) {
        console.warn(`[HallMonitorFactory] ⚠️ Specialization table might not exist:`, specError);
      }

      console.log(`[HallMonitorFactory] ✅ Found ${specializations.length} specializations for user ${userId}:`, specializations);

      // Build final user object
      const userData: MonitorUser = {
        id: userId,
        role_id: profile.role,
        role_name: roleName,
        email: email,
        display_name: profile.display_name || email,
        specializations
      };

      console.log(`[HallMonitorFactory] 💾 User data cached for: ${userId} with role: ${roleName}`);
      console.log(`[HallMonitorFactory] 🎉 Complete user data built for ${userId}:`, {
        id: userData.id,
        role_id: userData.role_id,
        role_name: userData.role_name,
        email: '[PROVIDED]',
        specializationCount: userData.specializations?.length || 0,
        displayName: userData.display_name
      });

      return userData;

    } catch (error) {
      console.error(`[HallMonitorFactory] ❌ Error building user data:`, error);
      return null;
    }
  }

  // ✅ CACHE MANAGEMENT
  clearUserCache(userId: string): void {
    this.userCache.delete(userId);
    console.log(`[HallMonitorFactory] 🗑️ Cache cleared for user: ${userId}`);
  }

  clearAllCache(): void {
    this.userCache.clear();
    console.log(`[HallMonitorFactory] 🗑️ All cache cleared`);
  }
}

// ✅ EXPORT SINGLETON INSTANCE
export const hallMonitorFactory = HallMonitorFactory.getInstance();