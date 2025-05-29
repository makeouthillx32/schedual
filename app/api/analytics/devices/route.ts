// Device breakdown data
interface DeviceAnalytics {
  name: string; // 'Desktop', 'Mobile', 'Tablet', 'Unknown' 
  percentage: number; // 0.65 = 65%
  amount: number; // actual count
  sessions: number;
  bounceRate: number;
}