// lib/analytics.ts - FIXED WITH GLOBAL DEBUG ACCESS
import { v4 as uuidv4 } from 'uuid';

interface PerformanceMetric {
  type: 'LCP' | 'FID' | 'CLS' | 'TTFB';
  value: number;
}

interface DeviceInfo {
  userAgent: string;
  screenWidth: number;
  screenHeight: number;
  language: string;
  timezone: string;
}

interface TrackingPayload {
  pageUrl: string;
  pageTitle?: string;
  referrer?: string;
  userAgent: string;
  sessionId: string;
  screenWidth?: number;
  screenHeight?: number;
  language?: string;
  timezone?: string;
  loadTime?: number;
  utmParams?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
}

interface EventPayload {
  sessionId: string;
  eventName: string;
  eventCategory?: string;
  eventAction?: string;
  eventLabel?: string;
  eventValue?: number;
  pageUrl?: string;
  metadata?: Record<string, any>;
}

class AnalyticsClient {
  private sessionId: string;
  private apiBase: string;
  private isInitialized = false;
  private isEnabled = true;
  private trackingStats = {
    pageViews: 0,
    events: 0,
    performance: 0,
    errors: 0
  };

  constructor(apiBase = '/api/analytics') {
    this.apiBase = apiBase;
    this.sessionId = this.initSession();
    console.log('📊 Analytics Client initialized:', {
      sessionId: this.sessionId,
      apiBase: this.apiBase
    });
  }

  // FIXED: Initialize session with proper persistence
  private initSession(): string {
    if (typeof window === 'undefined') {
      return uuidv4(); // Server-side fallback
    }

    // Try to get session from localStorage first (persists across browser tabs/sessions)
    let existingSession = localStorage.getItem('analytics_session_id');
    
    // If no localStorage session, check sessionStorage (tab-specific)
    if (!existingSession) {
      existingSession = sessionStorage.getItem('analytics_session_id');
    }
    
    // Check if session is still valid (not older than 30 minutes of inactivity)
    const lastActivity = localStorage.getItem('analytics_last_activity');
    const now = Date.now();
    const thirtyMinutes = 30 * 60 * 1000; // 30 minutes in ms
    
    if (existingSession && lastActivity) {
      const timeSinceLastActivity = now - parseInt(lastActivity);
      
      if (timeSinceLastActivity < thirtyMinutes) {
        // Session is still valid, update last activity
        localStorage.setItem('analytics_last_activity', now.toString());
        sessionStorage.setItem('analytics_session_id', existingSession);
        console.log('🔄 Reusing valid session:', existingSession);
        return existingSession;
      } else {
        console.log('⏰ Session expired, creating new one');
        // Session expired, clear old data
        localStorage.removeItem('analytics_session_id');
        localStorage.removeItem('analytics_last_activity');
        sessionStorage.removeItem('analytics_session_id');
      }
    }

    // Generate new session ID
    const newSessionId = uuidv4();
    
    // Store in both localStorage and sessionStorage
    localStorage.setItem('analytics_session_id', newSessionId);
    localStorage.setItem('analytics_last_activity', now.toString());
    sessionStorage.setItem('analytics_session_id', newSessionId);
    
    console.log('✨ Created new session:', newSessionId);
    return newSessionId;
  }

  // Update last activity on each tracking call
  private updateActivity(): void {
    if (typeof window !== 'undefined') {
      const now = Date.now();
      localStorage.setItem('analytics_last_activity', now.toString());
    }
  }

  // Get device and browser information
  private getDeviceInfo(): DeviceInfo {
    if (typeof window === 'undefined') {
      return {
        userAgent: '',
        screenWidth: 0,
        screenHeight: 0,
        language: 'en',
        timezone: 'UTC'
      };
    }

    const info = {
      userAgent: navigator.userAgent || '',
      screenWidth: screen.width || 0,
      screenHeight: screen.height || 0,
      language: navigator.language || 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    };

    console.log('🖥️ Device info collected:', {
      device: this.detectDeviceType(info.userAgent),
      browser: this.extractBrowser(info.userAgent),
      os: this.extractOS(info.userAgent),
      screen: `${info.screenWidth}x${info.screenHeight}`,
      language: info.language,
      timezone: info.timezone
    });

    return info;
  }

  // Helper functions for device detection (for logging)
  private detectDeviceType(userAgent: string): string {
    if (!userAgent) return 'unknown';
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) return 'mobile';
    if (ua.includes('tablet') || ua.includes('ipad')) return 'tablet';
    return 'desktop';
  }

  private extractBrowser(userAgent: string): string {
    if (!userAgent) return 'unknown';
    const ua = userAgent.toLowerCase();
    if (ua.includes('chrome') && !ua.includes('edge')) return 'Chrome';
    if (ua.includes('firefox')) return 'Firefox';
    if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
    if (ua.includes('edge')) return 'Edge';
    return 'unknown';
  }

  private extractOS(userAgent: string): string {
    if (!userAgent) return 'unknown';
    const ua = userAgent.toLowerCase();
    if (ua.includes('windows')) return 'Windows';
    if (ua.includes('macintosh') || ua.includes('mac os')) return 'macOS';
    if (ua.includes('linux')) return 'Linux';
    if (ua.includes('android')) return 'Android';
    if (ua.includes('iphone') || ua.includes('ipad')) return 'iOS';
    return 'unknown';
  }

  // Extract UTM parameters from URL
  private getUtmParams(url?: string): TrackingPayload['utmParams'] {
    if (typeof window === 'undefined' && !url) return undefined;
    
    try {
      const urlToCheck = url || window.location.href;
      const urlObj = new URL(urlToCheck);
      const params = urlObj.searchParams;

      const utmParams: TrackingPayload['utmParams'] = {};
      
      if (params.get('utm_source')) utmParams.source = params.get('utm_source')!;
      if (params.get('utm_medium')) utmParams.medium = params.get('utm_medium')!;
      if (params.get('utm_campaign')) utmParams.campaign = params.get('utm_campaign')!;
      if (params.get('utm_term')) utmParams.term = params.get('utm_term')!;
      if (params.get('utm_content')) utmParams.content = params.get('utm_content')!;

      const hasUtmParams = Object.keys(utmParams).length > 0;
      if (hasUtmParams) {
        console.log('🎯 UTM parameters detected:', utmParams);
      }

      return hasUtmParams ? utmParams : undefined;
    } catch (error) {
      console.warn('⚠️ Error parsing UTM params:', error);
      return undefined;
    }
  }

  // Auto-track page views
  async trackPageView(url?: string): Promise<void> {
    if (typeof window === 'undefined' || !this.isEnabled) return;

    // Update activity timestamp
    this.updateActivity();

    const deviceInfo = this.getDeviceInfo();
    const pageUrl = url || window.location.href;
    const pageTitle = document.title;
    const referrer = document.referrer;

    const payload: TrackingPayload = {
      pageUrl,
      pageTitle,
      referrer: referrer || undefined,
      userAgent: deviceInfo.userAgent,
      sessionId: this.sessionId,
      screenWidth: deviceInfo.screenWidth,
      screenHeight: deviceInfo.screenHeight,
      language: deviceInfo.language,
      timezone: deviceInfo.timezone,
      utmParams: this.getUtmParams(pageUrl)
    };

    console.log('📄 Tracking page view:', {
      url: pageUrl,
      title: pageTitle,
      referrer: referrer || 'direct',
      sessionId: this.sessionId
    });

    try {
      const startTime = performance.now();
      const response = await fetch(`${this.apiBase}/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const duration = Math.round(performance.now() - startTime);

      if (response.ok) {
        this.trackingStats.pageViews++;
        const result = await response.json();
        console.log('✅ Page view tracked successfully:', {
          status: response.status,
          duration: `${duration}ms`,
          totalPageViews: this.trackingStats.pageViews,
          userId: result.userId,
          deviceType: result.deviceType
        });
      } else {
        this.trackingStats.errors++;
        const errorText = await response.text();
        console.warn('❌ Page view tracking failed:', {
          status: response.status,
          statusText: response.statusText,
          duration: `${duration}ms`,
          error: errorText
        });
      }
    } catch (error) {
      this.trackingStats.errors++;
      console.error('❌ Page view tracking error:', error);
    }
  }

  // Track custom events
  async trackEvent(
    name: string, 
    properties?: {
      category?: string;
      action?: string;
      label?: string;
      value?: number;
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    if (typeof window === 'undefined' || !this.isEnabled) return;

    // Update activity timestamp
    this.updateActivity();

    const payload: EventPayload = {
      sessionId: this.sessionId,
      eventName: name,
      eventCategory: properties?.category,
      eventAction: properties?.action,
      eventLabel: properties?.label,
      eventValue: properties?.value,
      pageUrl: window.location.href,
      metadata: properties?.metadata,
    };

    console.log('🎯 Tracking event:', {
      name,
      category: properties?.category,
      action: properties?.action,
      label: properties?.label,
      value: properties?.value
    });

    try {
      const startTime = performance.now();
      const response = await fetch(`${this.apiBase}/event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const duration = Math.round(performance.now() - startTime);

      if (response.ok) {
        this.trackingStats.events++;
        console.log('✅ Event tracked successfully:', {
          event: name,
          duration: `${duration}ms`,
          totalEvents: this.trackingStats.events
        });
      } else {
        this.trackingStats.errors++;
        const errorText = await response.text();
        console.warn('❌ Event tracking failed:', {
          event: name,
          status: response.status,
          duration: `${duration}ms`,
          error: errorText
        });
      }
    } catch (error) {
      this.trackingStats.errors++;
      console.error('❌ Event tracking error:', error);
    }
  }

  // Track performance metrics
  async trackPerformance(metrics: PerformanceMetric[]): Promise<void> {
    if (typeof window === 'undefined' || !this.isEnabled) return;

    this.updateActivity();

    const payload = {
      sessionId: this.sessionId,
      pageUrl: window.location.href,
      metrics: metrics,
    };

    console.log('⚡ Tracking performance metrics:', metrics);

    try {
      const response = await fetch(`${this.apiBase}/performance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        this.trackingStats.performance++;
        console.log('✅ Performance metrics tracked:', {
          count: metrics.length,
          types: metrics.map(m => m.type),
          totalPerformanceEvents: this.trackingStats.performance
        });
      } else {
        this.trackingStats.errors++;
        console.warn('❌ Performance tracking failed:', response.status);
      }
    } catch (error) {
      this.trackingStats.errors++;
      console.error('❌ Performance tracking error:', error);
    }
  }

  // Track Web Vitals automatically
  async trackWebVitals(): Promise<void> {
    if (typeof window === 'undefined' || !this.isEnabled) return;

    try {
      console.log('🔄 Loading Web Vitals library...');
      const webVitals = await import('web-vitals');

      // Check if functions exist before calling
      if (webVitals.getCLS) {
        webVitals.getCLS((metric) => {
          console.log('📊 CLS metric:', metric.value);
          this.trackPerformance([{ type: 'CLS', value: metric.value }]);
        });
      }

      if (webVitals.getFID) {
        webVitals.getFID((metric) => {
          console.log('📊 FID metric:', metric.value);
          this.trackPerformance([{ type: 'FID', value: metric.value }]);
        });
      }

      if (webVitals.getLCP) {
        webVitals.getLCP((metric) => {
          console.log('📊 LCP metric:', metric.value);
          this.trackPerformance([{ type: 'LCP', value: metric.value }]);
        });
      }

      if (webVitals.getTTFB) {
        webVitals.getTTFB((metric) => {
          console.log('📊 TTFB metric:', metric.value);
          this.trackPerformance([{ type: 'TTFB', value: metric.value }]);
        });
      }

      console.log('✅ Web Vitals tracking initialized');

    } catch (error) {
      console.info('ℹ️ Web Vitals not available - skipping performance tracking');
    }
  }

  // Initialize automatic tracking
  init(): void {
    if (typeof window === 'undefined' || this.isInitialized) return;

    console.log('🚀 Initializing analytics tracking...');
    this.isInitialized = true;

    // Track initial page view
    this.trackPageView();

    // Track Web Vitals
    this.trackWebVitals();

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && this.isEnabled) {
        console.log('👋 Page hidden - tracking exit');
        this.trackEvent('page_exit', {
          category: 'engagement',
          action: 'page_visibility',
          label: 'hidden'
        });
      }
    });

    // Track scroll depth
    let maxScrollDepth = 0;
    const trackScrollDepth = () => {
      if (!this.isEnabled) return;
      
      const scrollDepth = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollDepth > maxScrollDepth && scrollDepth >= 25) {
        maxScrollDepth = scrollDepth;
        
        if (scrollDepth >= 25 && scrollDepth < 50) {
          console.log('📜 Scroll depth: 25%');
          this.trackEvent('scroll_depth', { category: 'engagement', label: '25%' });
        } else if (scrollDepth >= 50 && scrollDepth < 75) {
          console.log('📜 Scroll depth: 50%');
          this.trackEvent('scroll_depth', { category: 'engagement', label: '50%' });
        } else if (scrollDepth >= 75) {
          console.log('📜 Scroll depth: 75%');
          this.trackEvent('scroll_depth', { category: 'engagement', label: '75%' });
        }
      }
    };

    let scrollTimeout: NodeJS.Timeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(trackScrollDepth, 100);
    });

    // Track time on page
    const startTime = Date.now();
    window.addEventListener('beforeunload', () => {
      if (this.isEnabled) {
        const timeOnPage = Math.round((Date.now() - startTime) / 1000);
        console.log('⏱️ Time on page:', timeOnPage, 'seconds');
        this.trackEvent('time_on_page', {
          category: 'engagement',
          value: timeOnPage,
          metadata: { seconds: timeOnPage }
        });
      }
    });

    console.log('✅ Analytics tracking initialized successfully');
  }

  // Get current session ID
  getSessionId(): string {
    return this.sessionId;
  }

  // Manual page view tracking for SPA navigation
  onRouteChange(url: string): void {
    console.log('🔄 Route change detected:', url);
    this.trackPageView(url);
  }

  // Get tracking statistics
  getStats() {
    return {
      ...this.trackingStats,
      isEnabled: this.isEnabled,
      sessionId: this.sessionId
    };
  }

  // Method to re-enable tracking
  enable(): void {
    this.isEnabled = true;
    console.log('✅ Analytics tracking enabled');
  }

  // Method to disable tracking
  disable(): void {
    this.isEnabled = false;
    console.log('🚫 Analytics tracking disabled');
  }

  // Debug method to check if everything is working
  async debug(): Promise<void> {
    console.log('🔍 Analytics Debug Report:');
    console.log('Session ID:', this.sessionId);
    console.log('API Base:', this.apiBase);
    console.log('Is Enabled:', this.isEnabled);
    console.log('Is Initialized:', this.isInitialized);
    console.log('Tracking Stats:', this.trackingStats);
    console.log('Device Info:', this.getDeviceInfo());
    
    // Check session persistence
    if (typeof window !== 'undefined') {
      console.log('Session Storage:', {
        localStorage: localStorage.getItem('analytics_session_id'),
        sessionStorage: sessionStorage.getItem('analytics_session_id'),
        lastActivity: localStorage.getItem('analytics_last_activity')
      });
    }
    
    // Test API connectivity
    try {
      console.log('🧪 Testing API connectivity...');
      await this.trackEvent('debug_test', {
        category: 'debug',
        action: 'connectivity_test',
        metadata: { timestamp: Date.now() }
      });
      console.log('✅ API connectivity test passed');
    } catch (error) {
      console.error('❌ API connectivity test failed:', error);
    }
  }
}

// Create singleton instance
const analytics = new AnalyticsClient();

// ✅ FIXED: Always expose analytics globally for debugging
if (typeof window !== 'undefined') {
  // Expose analytics instance globally
  (window as any).analytics = analytics;
  
  // Add debug methods to window for easy access
  (window as any).analyticsDebug = () => analytics.debug();
  (window as any).analyticsStats = () => console.log(analytics.getStats());
  
  // Add more debug utilities
  (window as any).analyticsTest = () => {
    console.log('🧪 Testing analytics tracking...');
    analytics.trackEvent('manual_test', {
      category: 'debug',
      action: 'manual_trigger',
      label: 'console_test',
      value: 1,
      metadata: { 
        timestamp: Date.now(),
        source: 'browser_console'
      }
    });
  };

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      try {
        analytics.init();
        console.log('📊 Analytics ready! Try: analyticsDebug(), analyticsStats(), or analyticsTest()');
      } catch (error) {
        console.error('Analytics initialization failed:', error);
      }
    });
  } else {
    // DOM is already ready
    setTimeout(() => {
      try {
        analytics.init();
        console.log('📊 Analytics ready! Try: analyticsDebug(), analyticsStats(), or analyticsTest()');
      } catch (error) {
        console.error('Analytics initialization failed:', error);
      }
    }, 0);
  }
}

export default analytics;
export { AnalyticsClient };
export type { PerformanceMetric, DeviceInfo, TrackingPayload, EventPayload };