// hooks/useHallMonitor.ts - FIXED VERSION
import { useState, useEffect, useCallback, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type {
  HallMonitor,
  MonitorUser,
  ContentConfig,
  UserSpecialization,
  AccessContext,
  UseHallMonitorResult,
  AccessResult
} from '@/types/monitors';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Cache for monitors to avoid recreating them
const monitorCache = new Map<string, HallMonitor>();

// Simple in-memory cache for user data
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class SimpleCache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

const cache = new SimpleCache();

// Main hook for hall monitor functionality
export function useHallMonitor(userId?: string): UseHallMonitorResult {
  const [monitor, setMonitor] = useState<HallMonitor | null>(null);
  const [user, setUser] = useState<MonitorUser | null>(null);
  const [contentConfig, setContentConfig] = useState<ContentConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const isMounted = useRef(true);
  const currentUserId = useRef<string | undefined>(userId);

  // Update ref when userId changes
  useEffect(() => {
    currentUserId.current = userId;
  }, [userId]);

  // Fetch user data from your existing tables - FIXED to join with roles table
  const fetchUserData = useCallback(async (targetUserId: string): Promise<MonitorUser | null> => {
    try {
      console.log('[useHallMonitor] Fetching user data for:', targetUserId);
      
      // Check cache first
      const cacheKey = `user-${targetUserId}`;
      const cachedUser = cache.get<MonitorUser>(cacheKey);
      if (cachedUser) {
        console.log('[useHallMonitor] Using cached user data');
        return cachedUser;
      }

      // FIXED: Join with roles table to get actual role name
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id, 
          role,
          roles!inner(role)
        `)
        .eq('id', targetUserId)
        .single();

      if (profileError || !profile) {
        console.error('[useHallMonitor] Profile fetch error:', profileError);
        return null;
      }

      console.log('[useHallMonitor] Raw profile data:', profile);

      // Extract the actual role name from the joined roles table
      const actualRole = profile.roles?.role || profile.role;
      console.log('[useHallMonitor] Role ID from profiles:', profile.role);
      console.log('[useHallMonitor] Actual role name from roles table:', actualRole);

      // Fetch user specializations using your existing function
      const { data: specializations, error: specError } = await supabase
        .rpc('get_user_specializations', { user_uuid: targetUserId });

      if (specError) {
        console.error('[useHallMonitor] Specializations fetch error:', specError);
        // Don't fail if specializations fetch fails - user might not have any
      }

      // Get user email from auth if needed
      const { data: authUser } = await supabase.auth.getUser();
      const email = authUser.user?.id === targetUserId ? authUser.user.email : undefined;

      const userData: MonitorUser = {
        id: profile.id,
        email,
        role: actualRole, // Use the actual role name, not the ID
        specializations: specializations || []
      };

      // Cache the user data
      cache.set(cacheKey, userData);
      console.log('[useHallMonitor] User data fetched and cached:', userData);

      return userData;
    } catch (err) {
      console.error('[useHallMonitor] Error fetching user data:', err);
      return null;
    }
  }, []);

  // Get or create monitor for user's role
  const getMonitor = useCallback(async (userRole: string): Promise<HallMonitor | null> => {
    try {
      console.log('[useHallMonitor] Getting monitor for role:', userRole);
      
      // Check if we already have this monitor cached
      if (monitorCache.has(userRole)) {
        console.log('[useHallMonitor] Using cached monitor for role:', userRole);
        return monitorCache.get(userRole)!;
      }

      // Dynamically import the appropriate monitor
      let MonitorClass;
      
      switch (userRole) {
        case 'admin':
          const { AdminHallMonitor } = await import('@/lib/monitors/AdminHallMonitor');
          MonitorClass = AdminHallMonitor;
          break;
        case 'jobcoach':
          const { JobCoachHallMonitor } = await import('@/lib/monitors/JobCoachHallMonitor');
          MonitorClass = JobCoachHallMonitor;
          break;
        case 'client':
          const { ClientHallMonitor } = await import('@/lib/monitors/ClientHallMonitor');
          MonitorClass = ClientHallMonitor;
          break;
        case 'user':
          const { UserHallMonitor } = await import('@/lib/monitors/UserHallMonitor');
          MonitorClass = UserHallMonitor;
          break;
        default:
          console.warn('[useHallMonitor] Unknown role:', userRole, '- defaulting to UserHallMonitor');
          const { UserHallMonitor: DefaultMonitor } = await import('@/lib/monitors/UserHallMonitor');
          MonitorClass = DefaultMonitor;
      }

      const monitor = new MonitorClass();
      monitorCache.set(userRole, monitor);
      console.log('[useHallMonitor] Monitor created and cached for role:', userRole);
      
      return monitor;
    } catch (err) {
      console.error('[useHallMonitor] Error creating monitor:', err);
      return null;
    }
  }, []);

  // Initialize hook
  const initialize = useCallback(async () => {
    if (!userId || !isMounted.current) return;

    try {
      setIsLoading(true);
      setError(null);

      console.log('[useHallMonitor] Initializing for user:', userId);

      // Fetch user data
      const userData = await fetchUserData(userId);
      if (!userData || !isMounted.current) {
        setError('Failed to fetch user data');
        return;
      }

      console.log('[useHallMonitor] User data loaded:', userData);
      setUser(userData);

      // Get appropriate monitor
      const userMonitor = await getMonitor(userData.role);
      if (!userMonitor || !isMounted.current) {
        setError('Failed to create hall monitor');
        return;
      }

      console.log('[useHallMonitor] Monitor created for role:', userData.role);
      setMonitor(userMonitor);

      // Get content configuration
      const config = await userMonitor.getContentConfig(userId);
      if (isMounted.current) {
        setContentConfig(config);
        console.log('[useHallMonitor] Content config loaded:', config);
      }

      console.log('[useHallMonitor] Initialization complete');
    } catch (err) {
      console.error('[useHallMonitor] Initialization error:', err);
      if (isMounted.current) {
        setError('Failed to initialize hall monitor');
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [userId, fetchUserData, getMonitor]);

  // Initialize when userId changes
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Convenience method for access checking
  const canAccess = useCallback(async (
    resource: string, 
    action: string, 
    context?: AccessContext
  ): Promise<boolean> => {
    if (!monitor || !currentUserId.current) {
      console.warn('[useHallMonitor] canAccess called without monitor or userId');
      return false;
    }

    try {
      const result = await monitor.checkAccess(currentUserId.current, resource, action, context);
      return result.hasAccess;
    } catch (err) {
      console.error('[useHallMonitor] Access check error:', err);
      return false;
    }
  }, [monitor]);

  // Check if user has a specific feature
  const hasFeature = useCallback((feature: string): boolean => {
    return contentConfig?.availableFeatures.includes(feature) || false;
  }, [contentConfig]);

  // Check if user has a specific specialization
  const hasSpecialization = useCallback((specialization: string): boolean => {
    return user?.specializations?.some(s => s.name === specialization) || false;
  }, [user]);

  // Refresh configuration
  const refreshConfig = useCallback(async (): Promise<void> => {
    if (!monitor || !userId) return;

    try {
      console.log('[useHallMonitor] Refreshing configuration');
      
      // Clear cache for this user
      cache.delete(`user-${userId}`);
      
      // Re-fetch user data
      const userData = await fetchUserData(userId);
      if (userData && isMounted.current) {
        setUser(userData);
        
        // Get fresh content config
        const config = await monitor.getContentConfig(userId);
        if (isMounted.current) {
          setContentConfig(config);
        }
      }
    } catch (err) {
      console.error('[useHallMonitor] Refresh error:', err);
    }
  }, [monitor, userId, fetchUserData]);

  return {
    monitor,
    user,
    contentConfig,
    isLoading,
    error,
    canAccess,
    hasFeature,
    hasSpecialization,
    refreshConfig
  };
}

// Helper hook for simple access checking
export function useCanAccess(
  userId: string, 
  resource: string, 
  action: string, 
  context?: AccessContext
) {
  const [canAccess, setCanAccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const { monitor } = useHallMonitor(userId);

  useEffect(() => {
    async function checkAccess() {
      if (!monitor || !userId) {
        setCanAccess(false);
        setIsChecking(false);
        return;
      }

      try {
        setIsChecking(true);
        const result = await monitor.checkAccess(userId, resource, action, context);
        setCanAccess(result.hasAccess);
      } catch (err) {
        console.error('[useCanAccess] Error:', err);
        setCanAccess(false);
      } finally {
        setIsChecking(false);
      }
    }

    checkAccess();
  }, [monitor, userId, resource, action, context]);

  return { canAccess, isChecking };
}

// Helper hook for feature checking
export function useHasFeature(userId: string, feature: string) {
  const { contentConfig, isLoading } = useHallMonitor(userId);
  
  const hasFeature = contentConfig?.availableFeatures.includes(feature) || false;
  
  return { hasFeature, isLoading };
}

// Helper hook for specialization checking
export function useHasSpecialization(userId: string, specialization: string) {
  const { user, isLoading } = useHallMonitor(userId);
  
  const hasSpecialization = user?.specializations?.some(s => s.name === specialization) || false;
  
  return { hasSpecialization, isLoading };
}

// Cache management utilities
export const hallMonitorCache = {
  clear: () => cache.clear(),
  clearUser: (userId: string) => cache.delete(`user-${userId}`),
  clearMonitors: () => monitorCache.clear()
};