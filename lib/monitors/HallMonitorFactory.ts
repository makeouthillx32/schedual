// lib/monitors/HallMonitorFactory.ts - FIXED WITH PROPER SPECIALIZATION HANDLING
import { createBrowserClient } from '@supabase/ssr';
import type { 
  HallMonitor, 
  MonitorUser, 
  HallMonitorFactoryOptions
} from '@/types/monitors';

// Lazy imports for code splitting
const MONITOR_IMPORTS = {
  admin: () => import('./AdminHallMonitor').then(m => m.AdminHallMonitor),
  jobcoach: () => import('./JobCoachHallMonitor').then(m => m.JobCoachHallMonitor),
  client: () => import('./ClientHallMonitor').then(m => m.ClientHallMonitor),
  user: () => import('./UserHallMonitor').then(m => m.UserHallMonitor)
} as const;

// Role mapping - THIS IS THE KEY FIX
const ROLE_MAP: {[key: string]: string} = {
  'admin1': 'admin',
  'coachx7': 'jobcoach',
  'user0x': 'user',
  'client7x': 'client'
};

// Monitor cache to avoid recreating instances
const monitorInstances = new Map<string, HallMonitor>();

// User cache to avoid repeated database calls
interface UserCacheEntry {
  user: MonitorUser;
  timestamp: number;
  ttl: number;
}

class UserCache {
  private cache = new Map<string, UserCacheEntry>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  set(userId: string, user: MonitorUser, ttl?: number): void {
    this.cache.set(userId, {
      user,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    });
  }

  get(userId: string): MonitorUser | null {
    const entry = this.cache.get(userId);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(userId);
      return null;
    }
    
    return entry.user;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(userId: string): void {
    this.cache.delete(userId);
  }
}

// Simple error class
class HallMonitorError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'HallMonitorError';
  }
}

class HallMonitorFactory {
  private static instance: HallMonitorFactory;
  private supabase: any;
  private userCache: UserCache;
  private options: HallMonitorFactoryOptions;

  private constructor(options: HallMonitorFactoryOptions = {}) {
    this.supabase = options.supabaseClient || createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    this.userCache = new UserCache();
    this.options = {
      cacheEnabled: true,
      cacheTTL: 5 * 60 * 1000, // 5 minutes
      debug: process.env.NODE_ENV === 'development',
      ...options
    };

    this.log('🏭 Factory initialized with options:', this.options);
  }

  // Singleton pattern
  static getInstance(options?: HallMonitorFactoryOptions): HallMonitorFactory {
    if (!HallMonitorFactory.instance) {
      HallMonitorFactory.instance = new HallMonitorFactory(options);
    }
    return HallMonitorFactory.instance;
  }

  // Get monitor for a specific role NAME (not role ID)
  async getMonitor(roleName: string): Promise<HallMonitor> {
    this.log(`🎭 Getting monitor for role: ${roleName}`);

    // Validate role
    if (!this.isValidRole(roleName)) {
      throw new HallMonitorError(
        `Invalid role: ${roleName}`,
        'INVALID_ROLE',
        { roleName, validRoles: Object.keys(MONITOR_IMPORTS) }
      );
    }

    // Check cache first
    if (this.options.cacheEnabled && monitorInstances.has(roleName)) {
      this.log(`💾 Using cached monitor for role: ${roleName}`);
      return monitorInstances.get(roleName)!;
    }

    try {
      // Dynamically import and create monitor
      const MonitorClass = await MONITOR_IMPORTS[roleName as keyof typeof MONITOR_IMPORTS]();
      const monitor = new MonitorClass();

      // Cache the instance
      if (this.options.cacheEnabled) {
        monitorInstances.set(roleName, monitor);
        this.log(`✅ Monitor created and cached for role: ${roleName}`);
      }

      return monitor;
    } catch (error) {
      this.log(`❌ Error creating monitor for role ${roleName}:`, error);
      throw new HallMonitorError(
        `Failed to create monitor for role: ${roleName}`,
        'MONITOR_CREATION_FAILED',
        { roleName, error }
      );
    }
  }

  // Get monitor for a specific user - THIS IS THE MAIN METHOD
  async getMonitorForUser(userId: string): Promise<{ monitor: HallMonitor; user: MonitorUser }> {
    this.log(`👤 Getting monitor for user: ${userId}`);

    // Get user data (this resolves role ID to role name)
    const user = await this.getUserData(userId);
    if (!user) {
      throw new HallMonitorError(
        `User not found: ${userId}`,
        'USER_NOT_FOUND',
        { userId }
      );
    }

    // Get monitor for user's resolved role name
    const monitor = await this.getMonitor(user.role_name);

    return { monitor, user };
  }

  // ✅ FIXED: Better user data fetching with proper specialization handling
  async getUserData(userId: string, forceRefresh = false): Promise<MonitorUser | null> {
    this.log(`📊 Fetching user data for: ${userId}, forceRefresh: ${forceRefresh}`);

    // Check cache first (unless forcing refresh)
    if (this.options.cacheEnabled && !forceRefresh) {
      const cachedUser = this.userCache.get(userId);
      if (cachedUser) {
        this.log(`💾 Using cached user data for: ${userId}`);
        return cachedUser;
      }
    }

    try {
      // ✅ STEP 1: Get user's role from profiles table
      this.log(`🔍 Step 1: Fetching profile for user ${userId}`);
      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .select('id, role')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        this.log(`❌ Profile fetch error for ${userId}:`, profileError);
        return null;
      }

      this.log(`✅ Profile fetched: roleId=${profile.role}`);

      // ✅ STEP 2: Map role ID to role name using ROLE_MAP
      const roleId = profile.role; // This is 'admin1', 'coachx7', etc.
      const roleName = ROLE_MAP[roleId]; // This maps to 'admin', 'jobcoach', etc.

      if (!roleName) {
        this.log(`❌ No role mapping found for user ${userId}, role ID: ${roleId}`);
        this.log(`Available role mappings:`, Object.keys(ROLE_MAP));
        return null;
      }

      this.log(`🎯 Resolved role for ${userId}: ID="${roleId}" -> NAME="${roleName}"`);

      // ✅ STEP 3: Get user email if possible
      let email: string | undefined;
      try {
        const { data: authUser } = await this.supabase.auth.getUser();
        if (authUser.user?.id === userId) {
          email = authUser.user.email;
          this.log(`📧 Email retrieved for current user: ${email}`);
        }
      } catch (authError) {
        this.log(`⚠️ Auth user fetch failed (non-critical):`, authError);
      }

      // ✅ STEP 4: Fetch user specializations with proper error handling
      let specializations = [];
      this.log(`🎨 Step 4: Fetching specializations for user ${userId}`);
      
      try {
        const { data: specData, error: specError } = await this.supabase
          .rpc('get_user_specializations', { user_uuid: userId });

        if (specError) {
          this.log(`⚠️ Specializations fetch error for ${userId}:`, specError);
          // Don't fail the entire request - user might not have specializations yet
        } else if (specData && Array.isArray(specData)) {
          specializations = specData.map((spec: any) => ({
            id: spec.id,
            name: spec.name,
            description: spec.description || '',
            role_id: spec.role_id,
            role_name: spec.role_name,
            assigned_at: new Date().toISOString(), // Default if not provided
            assigned_by: spec.assigned_by || null
          }));
          this.log(`✅ Found ${specializations.length} specializations for user ${userId}:`, 
            specializations.map(s => s.name));
        } else {
          this.log(`ℹ️ No specializations found for user ${userId}`);
        }
      } catch (specError) {
        this.log(`⚠️ Specializations fetch failed (non-critical):`, specError);
        // Continue without specializations
      }

      // ✅ STEP 5: Build complete user data object
      const userData: MonitorUser = {
        id: profile.id,
        email,
        role_id: roleId,     // Original role ID from database ('admin1')
        role_name: roleName, // Mapped role name ('admin')
        specializations: specializations
      };

      // ✅ STEP 6: Cache the user data
      if (this.options.cacheEnabled) {
        this.userCache.set(userId, userData, this.options.cacheTTL);
        this.log(`💾 User data cached for: ${userId} with role: ${roleName}`);
      }

      this.log(`🎉 Complete user data built for ${userId}:`, {
        id: userData.id,
        role_id: userData.role_id,
        role_name: userData.role_name,
        email: userData.email ? '[PROVIDED]' : '[NOT_AVAILABLE]',
        specializationCount: userData.specializations?.length || 0,
        specializationNames: userData.specializations?.map(s => s.name) || []
      });

      return userData;

    } catch (error) {
      this.log(`❌ Error fetching user data for ${userId}:`, error);
      throw new HallMonitorError(
        `Failed to fetch user data for: ${userId}`,
        'USER_FETCH_FAILED',
        { userId, error }
      );
    }
  }

  // Quick access check without creating full monitor context
  async quickAccessCheck(
    userId: string, 
    resource: string, 
    action: string, 
    context?: Record<string, any>
  ): Promise<boolean> {
    try {
      const { monitor } = await this.getMonitorForUser(userId);
      const result = await monitor.checkAccess(userId, resource, action, context);
      return result.hasAccess;
    } catch (error) {
      this.log(`❌ Quick access check failed for ${userId}:`, error);
      return false;
    }
  }

  // Get user's available features
  async getUserFeatures(userId: string): Promise<string[]> {
    try {
      const { monitor } = await this.getMonitorForUser(userId);
      const config = await monitor.getContentConfig(userId);
      return config.availableFeatures;
    } catch (error) {
      this.log(`❌ Get user features failed for ${userId}:`, error);
      return [];
    }
  }

  // Check if user has specific specialization
  async userHasSpecialization(userId: string, specializationName: string): Promise<boolean> {
    try {
      const { monitor } = await this.getMonitorForUser(userId);
      return await monitor.hasSpecialization(userId, specializationName);
    } catch (error) {
      this.log(`❌ Specialization check failed for ${userId}:`, error);
      return false;
    }
  }

  // Validate role name exists (not role ID)
  private isValidRole(roleName: string): roleName is keyof typeof MONITOR_IMPORTS {
    return roleName in MONITOR_IMPORTS;
  }

  // Cache management
  clearCache(): void {
    this.log('🧹 Clearing all caches');
    monitorInstances.clear();
    this.userCache.clear();
  }

  clearUserCache(userId?: string): void {
    if (userId) {
      this.log(`🧹 Clearing cache for user: ${userId}`);
      this.userCache.delete(userId);
    } else {
      this.log('🧹 Clearing all user cache');
      this.userCache.clear();
    }
  }

  clearMonitorCache(role?: string): void {
    if (role) {
      this.log(`🧹 Clearing monitor cache for role: ${role}`);
      monitorInstances.delete(role);
    } else {
      this.log('🧹 Clearing all monitor cache');
      monitorInstances.clear();
    }
  }

  // Get cache stats for debugging
  getCacheStats(): { 
    userCacheSize: number; 
    monitorCacheSize: number; 
    cachedRoles: string[];
  } {
    return {
      userCacheSize: this.userCache['cache'].size,
      monitorCacheSize: monitorInstances.size,
      cachedRoles: Array.from(monitorInstances.keys())
    };
  }

  // ✅ ENHANCED: Better debug logging with emojis
  private log(message: string, ...args: any[]): void {
    if (this.options.debug) {
      console.log(`[HallMonitorFactory] ${message}`, ...args);
    }
  }

  // Get all available roles
  getAvailableRoles(): string[] {
    return Object.keys(MONITOR_IMPORTS);
  }

  // Preload monitors for better performance
  async preloadMonitors(roles: string[] = Object.keys(MONITOR_IMPORTS)): Promise<void> {
    this.log('🚀 Preloading monitors for roles:', roles);
    
    const preloadPromises = roles
      .filter(role => this.isValidRole(role))
      .map(role => this.getMonitor(role).catch(error => 
        this.log(`❌ Failed to preload monitor for ${role}:`, error)
      ));

    await Promise.allSettled(preloadPromises);
    this.log('✅ Monitor preloading complete');
  }

  // Health check for the factory
  async healthCheck(): Promise<{ 
    status: 'healthy' | 'degraded' | 'unhealthy';
    issues: string[];
    stats: any;
  }> {
    const issues: string[] = [];
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    try {
      // Test database connection
      const { error } = await this.supabase
        .from('profiles')
        .select('id, role')
        .limit(1);
      if (error) {
        issues.push(`Database connection issue: ${error.message}`);
        status = 'unhealthy';
      }

      // Test monitor creation
      try {
        await this.getMonitor('user'); // Test simplest monitor
      } catch (error) {
        issues.push(`Monitor creation issue: ${error}`);
        status = status === 'unhealthy' ? 'unhealthy' : 'degraded';
      }

      return {
        status,
        issues,
        stats: this.getCacheStats()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        issues: [`Health check failed: ${error}`],
        stats: this.getCacheStats()
      };
    }
  }
}

// Export singleton instance with default options
export const hallMonitorFactory = HallMonitorFactory.getInstance({
  cacheEnabled: true,
  cacheTTL: 5 * 60 * 1000,
  debug: process.env.NODE_ENV === 'development'
});

// Convenience functions for common operations
export const getMonitorForUser = (userId: string) => 
  hallMonitorFactory.getMonitorForUser(userId);

export const quickAccessCheck = (
  userId: string, 
  resource: string, 
  action: string, 
  context?: Record<string, any>
) => hallMonitorFactory.quickAccessCheck(userId, resource, action, context);

export const getUserFeatures = (userId: string) => 
  hallMonitorFactory.getUserFeatures(userId);

export const userHasSpecialization = (userId: string, specializationName: string) => 
  hallMonitorFactory.userHasSpecialization(userId, specializationName);

// Export the error class
export { HallMonitorError };