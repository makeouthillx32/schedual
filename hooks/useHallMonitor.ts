// hooks/useHallMonitor.ts - FIXED INFINITE LOADING ISSUE
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for cleanup and state management
  const isMounted = useRef(true);
  const currentUserId = useRef<string | undefined>(undefined);
  const isCurrentlyLoading = useRef(false);

  // ✅ FIXED: Simplified loading function with proper state management
  const loadUserData = useCallback(async (targetUserId: string) => {
    // Prevent duplicate calls
    if (isCurrentlyLoading.current) {
      console.log('[useHallMonitor] ⏭️ Already loading, skipping');
      return;
    }

    // Check if we already have data for this user
    if (currentUserId.current === targetUserId && user && monitor && contentConfig) {
      console.log('[useHallMonitor] ⏭️ Data already loaded for user:', targetUserId);
      return;
    }

    console.log('[useHallMonitor] 🔄 Loading user data for:', targetUserId);
    
    try {
      isCurrentlyLoading.current = true;
      setIsLoading(true);
      setError(null);

      // Get monitor and user data from factory
      const result = await hallMonitorFactory.getMonitorForUser(targetUserId);
      
      // Check if component was unmounted
      if (!isMounted.current) {
        console.log('[useHallMonitor] Component unmounted, aborting');
        return;
      }

      console.log('[useHallMonitor] ✅ Factory returned:', {
        hasUser: !!result.user,
        hasMonitor: !!result.monitor,
        userRole: result.user?.role_name
      });

      // Set user and monitor immediately
      setUser(result.user);
      setMonitor(result.monitor);

      // Get content config with fallback
      let config: ContentConfig;
      try {
        console.log('[useHallMonitor] 📋 Getting content config...');
        config = await result.monitor.getContentConfig(targetUserId);
        console.log('[useHallMonitor] ✅ Content config received');
      } catch (configError) {
        console.warn('[useHallMonitor] Config error, using fallback:', configError);
        
        // ✅ CRITICAL FIX: Always provide a fallback config
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

      // Final state update
      if (isMounted.current) {
        setContentConfig(config);
        currentUserId.current = targetUserId;
        setError(null);
        console.log('[useHallMonitor] 🎉 Successfully loaded data for:', targetUserId);
      }

    } catch (err) {
      console.error('[useHallMonitor] ❌ Loading error:', err);
      
      if (isMounted.current) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load user data';
        setError(errorMessage);
        setUser(null);
        setMonitor(null);
        setContentConfig(null);
        currentUserId.current = undefined;
      }
    } finally {
      // ✅ CRITICAL: Always clear loading state
      if (isMounted.current) {
        setIsLoading(false);
        console.log('[useHallMonitor] ✅ Loading complete, isLoading set to false');
      }
      isCurrentlyLoading.current = false;
    }
  }, []); // No dependencies to prevent recreation

  // ✅ Effect to handle userId changes
  useEffect(() => {
    console.log('[useHallMonitor] Effect triggered with userId:', userId);

    // Reset everything if no userId
    if (!userId) {
      console.log('[useHallMonitor] No userId, resetting state');
      setUser(null);
      setMonitor(null);
      setContentConfig(null);
      setIsLoading(false);
      setError(null);
      currentUserId.current = undefined;
      isCurrentlyLoading.current = false;
      return;
    }

    // Only load if userId changed or we don't have complete data
    const needsLoading = currentUserId.current !== userId || !user || !monitor || !contentConfig;
    
    if (needsLoading) {
      console.log('[useHallMonitor] 🚀 Need to load data for:', userId);
      loadUserData(userId);
    } else {
      console.log('[useHallMonitor] ✅ Data already available for:', userId);
    }
  }, [userId, loadUserData]);

  // ✅ Cleanup effect
  useEffect(() => {
    return () => {
      console.log('[useHallMonitor] 🧹 Cleanup');
      isMounted.current = false;
    };
  }, []);

  // ✅ Helper functions with stable references
  const canAccess = useCallback(async (
    resource: string, 
    action: string, 
    context?: AccessContext
  ): Promise<boolean> => {
    if (!monitor || !user) return false;

    try {
      const result = await monitor.checkAccess(user.id, resource, action, context);
      return result.hasAccess;
    } catch (err) {
      console.error('[useHallMonitor] Access check error:', err);
      return false;
    }
  }, [monitor, user]);

  const hasFeature = useCallback((feature: string): boolean => {
    return contentConfig?.availableFeatures.includes(feature) ?? false;
  }, [contentConfig]);

  const hasSpecialization = useCallback((specialization: string): boolean => {
    return user?.specializations?.some(spec => spec.name === specialization) ?? false;
  }, [user]);

  const refreshConfig = useCallback(async (): Promise<void> => {
    if (!userId) return;
    
    console.log('[useHallMonitor] 🔄 Refreshing config for:', userId);
    hallMonitorFactory.clearUserCache(userId);
    currentUserId.current = undefined;
    await loadUserData(userId);
  }, [userId, loadUserData]);

  // ✅ SIMPLIFIED: Early return with fallback for no userId
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

  // ✅ Debug current state (reduced logging)
  const hasCompleteData = !!(user && monitor && contentConfig);
  if (isLoading || !hasCompleteData) {
    console.log('[useHallMonitor] 📊 State:', {
      userId: userId.substring(0, 8) + '...',
      hasCompleteData,
      isLoading,
      error: !!error
    });
  }

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