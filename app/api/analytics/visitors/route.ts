// Visitor timeline data
interface VisitorAnalytics {
  x: string; // date or hour
  y: number; // visitor count
  sessions?: number;
  pageViews?: number;
}