// lib/analytics.ts
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
  private isEnabled = true; // Add feature flag

  constructor(apiBase = '/api/analytics') {
    this.apiBase = apiBase;
    this.sessionId = this.initSession();
  }

  // Initialize session with UUID
  private initSession(): string {
    if (typeof window === 'undefined') {
      return uuidv4(); // Server-side fallback
    }

    // Check for existing session in sessionStorage
    const existingSession = sessionStorage.getItem('analytics_session_id');
    if (existingSession) {
      return existingSession;
    }

    // Generate new session ID
    const newSessionId = uuidv4();
    sessionStorage.setItem('analytics_session_id', newSessionId);
    return newSessionId;
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

    return {
      userAgent: navigator.userAgent || '',
      screenWidth: screen.width || 0,
      screenHeight: screen.height || 0,
      language: navigator.language || 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    };
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

      return Object.keys(utmParams).length > 0 ? utmParams : undefined;
    } catch (error) {
      console.warn('Error parsing UTM params:', error);
      return undefined;
    }
  }

  // Auto-track page views
  async trackPageView(url?: string): Promise<void> {
    if (typeof window === 'undefined' || !this.isEnabled) return;

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

    try {
      const response = await fetch(`${this.apiBase}/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Silently fail - don't spam console on every page load
        this.isEnabled = false; // Disable further tracking if API is down
      }
    } catch (error) {
      // Silently fail and disable
      this.isEnabled = false;
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

    try {
      const response = await fetch(`${this.apiBase}/event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Silently fail
        this.isEnabled = false;
      }
    } catch (error) {
      // Silently fail
      this.isEnabled = false;
    }
  }

  // Track performance metrics
  async trackPerformance(metrics: PerformanceMetric[]): Promise<void> {
    if (typeof window === 'undefined' || !this.isEnabled) return;

    const payload = {
      sessionId: this.sessionId,
      pageUrl: window.location.href,
      metrics: metrics,
    };

    try {
      const response = await fetch(`${this.apiBase}/performance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        this.isEnabled = false;
      }
    } catch (error) {
      this.isEnabled = false;
    }
  }

  // Track Web Vitals automatically - FIXED VERSION
  async trackWebVitals(): Promise<void> {
    if (typeof window === 'undefined' || !this.isEnabled) return;

    try {
      // Dynamically import web-vitals with proper error handling
      const webVitals = await import('web-vitals');
      
      // Check if functions exist before calling
      if (webVitals.getCLS) {
        webVitals.getCLS((metric) => {
          this.trackPerformance([{ type: 'CLS', value: metric.value }]);
        });
      }

      if (webVitals.getFID) {
        webVitals.getFID((metric) => {
          this.trackPerformance([{ type: 'FID', value: metric.value }]);
        });
      }

      if (webVitals.getLCP) {
        webVitals.getLCP((metric) => {
          this.trackPerformance([{ type: 'LCP', value: metric.value }]);
        });
      }

      if (webVitals.getTTFB) {
        webVitals.getTTFB((metric) => {
          this.trackPerformance([{ type: 'TTFB', value: metric.value }]);
        });
      }

    } catch (error) {
      // Web vitals not available - that's fine, just skip it
      console.info('Web Vitals not available - skipping performance tracking');
    }
  }

  // Initialize automatic tracking
  init(): void {
    if (typeof window === 'undefined' || this.isInitialized) return;

    this.isInitialized = true;

    // Track initial page view
    this.trackPageView();

    // Track Web Vitals (with error handling)
    this.trackWebVitals();

    // Track page visibility changes (only if enabled)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && this.isEnabled) {
        this.trackEvent('page_exit', {
          category: 'engagement',
          action: 'page_visibility',
          label: 'hidden'
        });
      }
    });

    // Track scroll depth (throttled)
    let maxScrollDepth = 0;
    const trackScrollDepth = () => {
      if (!this.isEnabled) return;
      
      const scrollDepth = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        
        // Track milestone scroll depths
        if (scrollDepth >= 25 && scrollDepth < 50) {
          this.trackEvent('scroll_depth', { category: 'engagement', label: '25%' });
        } else if (scrollDepth >= 50 && scrollDepth < 75) {
          this.trackEvent('scroll_depth', { category: 'engagement', label: '50%' });
        } else if (scrollDepth >= 75) {
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
        this.trackEvent('time_on_page', {
          category: 'engagement',
          value: timeOnPage,
          metadata: { seconds: timeOnPage }
        });
      }
    });
  }

  // Get current session ID
  getSessionId(): string {
    return this.sessionId;
  }

  // Manual page view tracking for SPA navigation
  onRouteChange(url: string): void {
    this.trackPageView(url);
  }

  // Method to re-enable tracking
  enable(): void {
    this.isEnabled = true;
  }

  // Method to disable tracking
  disable(): void {
    this.isEnabled = false;
  }
}

// Create singleton instance
const analytics = new AnalyticsClient();

// Auto-initialize on client side (with error protection)
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      try {
        analytics.init();
      } catch (error) {
        console.info('Analytics initialization skipped');
      }
    });
  } else {
    // DOM is already ready
    setTimeout(() => {
      try {
        analytics.init();
      } catch (error) {
        console.info('Analytics initialization skipped');
      }
    }, 0);
  }
}

export default analytics;
export { AnalyticsClient };
export type { PerformanceMetric, DeviceInfo, TrackingPayload, EventPayload };