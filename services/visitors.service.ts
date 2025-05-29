export async function getVisitorsAnalyticsData() {
  try {
    // Calculate date range - last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);

    // Fetch visitor analytics from our API
    const response = await fetch(`/api/analytics/visitors?start=${startDate.toISOString()}&end=${endDate.toISOString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn('Analytics API not available, using fallback');
      // Return empty array instead of dummy data
      return [];
    }

    const data = await response.json();
    
    // Transform API response to match expected format
    const visitorStats = data.visitors || [];
    
    return visitorStats.map((stat: any, index: number) => ({
      x: (index + 1).toString(), // Day number as string
      y: stat.unique_visitors || stat.sessions_count || 0 // Visitor count
    }));

  } catch (error) {
    console.error('Error fetching visitor analytics:', error);
    
    // Return empty array on error (no more dummy data!)
    return [];
  }
}