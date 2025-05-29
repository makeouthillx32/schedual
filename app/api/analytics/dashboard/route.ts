// Main dashboard data
interface DashboardResponse {
  overview: {
    totalUsers: number;
    totalSessions: number; 
    totalPageViews: number;
    bounceRate: number;
    avgSessionDuration: number;
    periodComparison: {
      users: { current: number; previous: number; change: number };
      sessions: { current: number; previous: number; change: number };
      pageViews: { current: number; previous: number; change: number };
    };
  };
  devices: DeviceAnalytics[];
  visitors: VisitorAnalytics[];
  topPages: PageAnalytics[];
  realtimeUsers: number;
}