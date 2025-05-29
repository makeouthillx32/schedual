// services/visitors.service.ts
export interface VisitorData {
  x: string;
  y: number;
}

export async function getVisitorsAnalyticsData(
  timeFrame?: "daily" | "hourly" | (string & {}),
): Promise<VisitorData[]> {
  try {
    // Calculate date range - default to last 30 days
    const endDate = new Date();
    let startDate = new Date();
    let granularity = 'daily';
    
    if (timeFrame === "hourly") {
      // Last 24 hours
      startDate.setHours(endDate.getHours() - 24);
      granularity = 'hourly';
    } else {
      // Last 30 days
      startDate.setDate(endDate.getDate() - 30);
      granularity = 'daily';
    }

    // Fetch visitor analytics from our API
    const response = await fetch(`/api/analytics/visitors?start=${startDate.toISOString()}&end=${endDate.toISOString()}&granularity=${granularity}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Analytics API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the API response to match the expected format
    const visitorStats = data.visitors || [];
    
    const result: VisitorData[] = visitorStats.map((stat: any, index: number) => {
      let xLabel: string;
      
      if (granularity === 'hourly') {
        // For hourly data, show hour (0-23)
        const hour = new Date(stat.date_hour).getHours();
        xLabel = hour.toString();
      } else {
        // For daily data, show day number or date
        xLabel = (index + 1).toString();
      }
      
      return {
        x: xLabel,
        y: stat.unique_visitors || stat.sessions_count || 0
      };
    });

    // If no data, return empty array
    if (result.length === 0) {
      console.warn('No visitor analytics data available');
      return [];
    }

    return result;

  } catch (error) {
    console.error('Error fetching visitor analytics:', error);
    
    // Return empty array on error
    return [];
  }
}

// Additional function for real-time visitor count
export async function getRealTimeVisitorsCount(): Promise<number> {
  try {
    const response = await fetch('/api/analytics/realtime', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Realtime API error: ${response.status}`);
    }

    const data = await response.json();
    return data.activeUsers || 0;

  } catch (error) {
    console.error('Error fetching realtime visitors:', error);
    return 0;
  }
}