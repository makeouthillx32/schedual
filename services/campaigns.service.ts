// services/campaigns.service.ts
export interface CampaignData {
  total_visitors: number;
  performance: number;
  chart: Array<{ x: string; y: number }>;
}

export async function getCampaignVisitorsData(
  timeFrame?: "weekly" | "monthly" | (string & {}),
): Promise<CampaignData> {
  try {
    // Calculate date range - default to last 7 days for campaign data
    const endDate = new Date();
    let startDate = new Date();
    
    if (timeFrame === "monthly") {
      startDate.setMonth(endDate.getMonth() - 1);
    } else {
      // Default to weekly
      startDate.setDate(endDate.getDate() - 7);
    }

    // Calculate previous period for performance comparison
    const prevStartDate = new Date(startDate);
    const prevEndDate = new Date(startDate);
    const periodLength = endDate.getTime() - startDate.getTime();
    prevStartDate.setTime(prevStartDate.getTime() - periodLength);

    // Fetch campaign/UTM analytics from our API
    const [currentResponse, previousResponse] = await Promise.all([
      fetch(`/api/analytics/campaigns?start=${startDate.toISOString()}&end=${endDate.toISOString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }),
      fetch(`/api/analytics/campaigns?start=${prevStartDate.toISOString()}&end=${prevEndDate.toISOString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
    ]);

    if (!currentResponse.ok) {
      throw new Error(`Campaign API error: ${currentResponse.status}`);
    }

    const currentData = await currentResponse.json();
    const previousData = previousResponse.ok ? await previousResponse.json() : null;
    
    // Calculate total visitors from current period
    const totalVisitors = currentData.totalVisitors || 0;
    
    // Calculate performance vs previous period
    const previousVisitors = previousData?.totalVisitors || 0;
    let performance = 0;
    
    if (previousVisitors > 0) {
      performance = ((totalVisitors - previousVisitors) / previousVisitors) * 100;
    }

    // Transform daily/weekly data for chart
    const chartData = (currentData.dailyStats || []).map((stat: any, index: number) => {
      let dayLabel: string;
      
      if (timeFrame === "monthly") {
        // For monthly view, show week numbers or dates
        const date = new Date(stat.date);
        dayLabel = `W${Math.ceil(index / 7 + 1)}`;
      } else {
        // For weekly view, show day abbreviations
        const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        const date = new Date(stat.date);
        dayLabel = dayNames[date.getDay()];
      }
      
      return {
        x: dayLabel,
        y: stat.visitors || stat.sessions_count || 0
      };
    });

    const result: CampaignData = {
      total_visitors: totalVisitors,
      performance: Math.round(performance * 10) / 10, // Round to 1 decimal
      chart: chartData
    };

    return result;

  } catch (error) {
    console.error('Error fetching campaign analytics:', error);
    
    // Return empty data structure on error
    return {
      total_visitors: 0,
      performance: 0,
      chart: []
    };
  }
}

// Additional function to get UTM source breakdown
export async function getUTMSourceBreakdown(
  timeFrame?: "weekly" | "monthly" | (string & {})
): Promise<Array<{ source: string; visitors: number; percentage: number }>> {
  try {
    const endDate = new Date();
    let startDate = new Date();
    
    if (timeFrame === "monthly") {
      startDate.setMonth(endDate.getMonth() - 1);
    } else {
      startDate.setDate(endDate.getDate() - 7);
    }

    const response = await fetch(`/api/analytics/utm-sources?start=${startDate.toISOString()}&end=${endDate.toISOString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`UTM API error: ${response.status}`);
    }

    const data = await response.json();
    const sources = data.sources || [];
    const totalVisitors = sources.reduce((sum: number, source: any) => sum + source.visitors, 0);
    
    return sources.map((source: any) => ({
      source: source.utm_source || 'Direct',
      visitors: source.visitors || 0,
      percentage: totalVisitors > 0 ? (source.visitors / totalVisitors) * 100 : 0
    }));

  } catch (error) {
    console.error('Error fetching UTM source breakdown:', error);
    return [];
  }
}