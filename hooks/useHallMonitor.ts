// hooks/useHallMonitor.ts - FINAL FIX FOR INFINITE LOADING
import { useState, useEffect, useRef, useCallback } from 'react';
import { hallMonitorFactory } from '@/lib/monitors/HallMonitorFactory';
import type { 
  MonitorUser, 
  HallMonitor, 
  ContentConfig, 
  AccessContext,
  UseHallMonitorResult
} from '@/types/monitors';

export function useHallMonitor(userId?: string): UseHallMonitorResult {
  // State
  const [user, setUser] = useState<MonitorUser | null>(null);
  const [monitor, setMonitor] = useState<HallMonitor | null>(null);
  const [contentConfig, setContentConfig] = useState<ContentConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs for cleanup and state management
  const isMounted = useRef(true);
  const loadingRef = useRef(false);
  const lastLoadedUserId = useRef<string | undefined>(undefined);
  const abortControllerRef = useRef<AbortController | null>(null);

  // ✅ CRITICAL FIX: Single, atomic loading function
  const loadUserData = useCallback(async (targetUserId: string) => {
    // ✅ Prevent duplicate concurrent calls
    if (loadingRef.current) {
      console.log('[useHallMonitor] ⏭️ Already loading, skipping duplicate call');
      return;
    }

    // ✅ Skip if we already loaded this user successfully
    if (lastLoadedUserId.current === targetUserId && user && monitor && contentConfig) {
      console.log('[useHallMonitor] ⏭️ User already loaded successfully, skipping');
      if (isLoading) {
        setIsLoading(false);
      }
      return;
    }

    console.log('[useHallMonitor] 🔄 Loading user data for:', targetUserId);

    // ✅ Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      loadingRef.current = true;
      setIsLoading(true);
      setError(null);

      console.log('[useHallMonitor] 📞 Calling hallMonitorFactory.getMonitorForUser...');
      
      // ✅ STEP 1: Get monitor and user data
      const result = await hallMonitorFactory.getMonitorForUser(targetUserId);
      
      // ✅ Check if component was unmounted or request was aborted
      if (!isMounted.current || abortControllerRef.current.signal.aborted) {
        console.log('[useHallMonitor] ⏭️ Request aborted or component unmounted');
        return;
      }

      console.log('[useHallMonitor] ✅ Got monitor result:', {
        hasUser: !!result.user,
        hasMonitor: !!result.monitor,
        userRoleId: result.user?.role_id,
        userRoleName: result.user?.role_name,
        monitorRole: result.monitor?.role_name
      });

      // ✅ STEP 2: Set user and monitor first
      setUser(result.user);
      setMonitor(result.monitor);

      // ✅ STEP 3: Get content config with error handling
      console.log('[useHallMonitor] 📋 Loading content config...');
      
      let config: ContentConfig;
      try {
        config = await result.monitor.getContentConfig(targetUserId);
        console.log('[useHallMonitor] ✅ Content config loaded:', {
          dashboardLayout: config.dashboardLayout,
          featuresCount: config.availableFeatures.length,
          permissionsCount: config.permissions.length
        });
      } catch (configError) {
        console.error('[useHallMonitor] ❌ Content config error, using fallback:', configError);
        
        // ✅ Fallback config if content config fails
        config = {
          dashboardLayout: 'user-basic' as any,
          availableFeatures: ['profile-view'],
          primaryActions: [],
          secondaryActions: [],
          navigationItems: [],
          hiddenSections: [],
          customFields: {},
          visibleComponents: [],
          permissions: ['profile:read_own']
        };
      }

      // ✅ Check again after async operation
      if (!isMounted.current || abortControllerRef.current.signal.aborted) {
        console.log('[useHallMonitor] ⏭️ Request aborted during config load');
        return;
      }

      // ✅ STEP 4: Set final state atomically
      setContentConfig(config);
      setError(null);
      lastLoadedUserId.current = targetUserId;

      console.log('[useHallMonitor] 🎉 Load complete for user:', targetUserId);

    } catch (err) {
      console.error('[useHallMonitor] ❌ Error loading user data:', err);
      
      if (!isMounted.current || abortControllerRef.current.signal.aborted) {
        console.log('[useHallMonitor] ⏭️ Error occurred but request was aborted');
        return;
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to load user data';
      setError(errorMessage);
      setUser(null);
      setMonitor(null);
      setContentConfig(null);
      lastLoadedUserId.current = undefined;
    } finally {
      if (isMounted.current && !abortControllerRef.current.signal.aborted) {
        setIsLoading(false); // ✅ CRITICAL: Always clear loading state
        console.log('[useHallMonitor] ✅ Loading state cleared');
      }
      loadingRef.current = false; // ✅ CRITICAL: Always clear loading flag
    }
  }, []); // ✅ Empty deps to prevent recreation

  // ✅ Effect to handle userId changes
  useEffect(() => {
    // ✅ Reset state when no userId
    if (!userId) {
      console.log('[useHallMonitor] 🚫 No userId provided, resetting state');
      setUser(null);
      setMonitor(null);
      setContentConfig(null);
      setIsLoading(false);
      setError(null);
      loadingRef.current = false;
      lastLoadedUserId.current = undefined;
      
      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      return;
    }

    // ✅ Only load if userId actually changed or we don't have complete data
    const needsLoad = lastLoadedUserId.current !== userId || !user || !monitor || !contentConfig;
    
    if (needsLoad) {
      console.log('[useHallMonitor] 🚀 Starting load for userId:', userId, {
        lastLoaded: lastLoadedUserId.current,
        hasUser: !!user,
        hasMonitor: !!monitor,
        hasConfig: !!contentConfig
      });
      loadUserData(userId);
    } else {
      console.log('[useHallMonitor] ⏭️ Data already loaded for userId:', userId);
      // Ensure loading is false if we have all data
      if (isLoading) {
        setIsLoading(false);
      }
    }
  }, [userId, loadUserData]); // ✅ Minimal deps

  // ✅ Cleanup effect
  useEffect(() => {
    return () => {
      console.log('[useHallMonitor] 🧹 Cleaning up hook');
      isMounted.current = false;
      loadingRef.current = false;
      
      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // ✅ Memoized helper functions (no deps on changing values)
  const canAccess = useCallback(async (
    resource: string, 
    action: string, 
    context?: AccessContext
  ): Promise<boolean> => {
    if (!monitor || !user) {
      return false;
    }

    try {
      const result = await monitor.checkAccess(user.id, resource, action, context);
      return result.hasAccess;
    } catch (err) {
      console.error('[useHallMonitor] Access check error:', err);
      return false;
    }
  }, [monitor, user]);

  const hasFeature = useCallback((feature: string): boolean => {
    if (!contentConfig) return false;
    return contentConfig.availableFeatures.includes(feature);
  }, [contentConfig]);

  const hasSpecialization = useCallback((specialization: string): boolean => {
    if (!user || !user.specializations) return false;
    return user.specializations.some(spec => spec.name === specialization);
  }, [user]);

  const refreshConfig = useCallback(async (): Promise<void> => {
    if (!userId || loadingRef.current) return;
    
    console.log('[useHallMonitor] 🔄 Refreshing configuration...');
    
    // Clear cache and force reload
    hallMonitorFactory.clearUserCache(userId);
    lastLoadedUserId.current = undefined;
    await loadUserData(userId);
  }, [userId, loadUserData]);

  // ✅ Early return for no userId
  if (!userId) {
    return {
      monitor: null,
      user: null,
      contentConfig: null,
      isLoading: false,
      error: null,
      canAccess: async () => false,
      hasFeature: () => false,
      hasSpecialization: () => false,
      refreshConfig: async () => {}
    };
  }

  // ✅ Debug current state
  console.log('[useHallMonitor] 📊 Current state:', {
    userId,
    hasUser: !!user,
    userRole: user?.role_name,
    hasMonitor: !!monitor,
    hasConfig: !!contentConfig,
    isLoading,
    error,
    lastLoaded: lastLoadedUserId.current
  });

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

export default useHallMonitor;