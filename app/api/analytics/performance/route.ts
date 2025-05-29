// Track performance metrics
interface PerformancePayload {
  sessionId: string;
  pageUrl: string;
  metrics: {
    type: 'LCP' | 'FID' | 'CLS' | 'TTFB';
    value: number;
  }[];
}