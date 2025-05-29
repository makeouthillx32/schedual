// services/devices.service.ts
export interface DeviceData {
  name: string;
  percentage: number;
  amount: number;
}

export interface DeviceBreakdown {
  device: string;
  sessions: number;
  users: number;
  bounceRate: number;
  avgSessionDuration: number;
}

export async function getDevicesUsedData(
  timeFrame?: "monthly" | "yearly" | (string & {}),
): Promise<DeviceData[]> {
  try {
    // SERVER-SIDE SAFETY CHECK 
    if (typeof window === 'undefined') {
      console.log('🏢 Server-side rendering detected - returning empty data for devices');
      return [];
    }

    // Calculate date range based on timeFrame
    const endDate = new Date();
    let startDate = new Date();
    
    if (timeFrame === "yearly") {
      startDate.setFullYear(endDate.getFullYear() - 1);
    } else {
      // Default to monthly
      startDate.setMonth(endDate.getMonth() - 1);
    }

    // Fetch device analytics from our API
    const response = await fetch(`/api/analytics/devices?start=${startDate.toISOString()}&end=${endDate.toISOString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn('Device analytics API not available:', response.status);
      return [];
    }

    const data = await response.json();
    
    // Transform the API response to match the expected format
    const deviceStats = data.devices || [];
    const totalSessions = deviceStats.reduce((sum: number, device: any) => sum + (device.sessions_count || 0), 0);
    
    // Map to the expected format
    const result: DeviceData[] = deviceStats.map((device: any) => ({
      name: capitalizeDeviceType(device.device_type),
      percentage: totalSessions > 0 ? (device.sessions_count || 0) / totalSessions : 0,
      amount: device.sessions_count || 0,
    }));

    // Sort by amount (highest first)
    result.sort((a, b) => b.amount - a.amount);

    // If no data, return empty array
    if (result.length === 0) {
      console.info('📱 No device analytics data available yet');
      return [];
    }

    return result;

  } catch (error) {
    console.error('❌ Error fetching device analytics:', error);
    
    // Return empty array on error (no more dummy data!)
    return [];
  }
}

// Get detailed device breakdown with more metrics
export async function getDeviceBreakdown(
  timeFrame?: "monthly" | "yearly" | (string & {}),
): Promise<DeviceBreakdown[]> {
  try {
    // SERVER-SIDE SAFETY CHECK
    if (typeof window === 'undefined') {
      return [];
    }

    const endDate = new Date();
    let startDate = new Date();
    
    if (timeFrame === "yearly") {
      startDate.setFullYear(endDate.getFullYear() - 1);
    } else {
      startDate.setMonth(endDate.getMonth() - 1);
    }

    const response = await fetch(`/api/analytics/devices?start=${startDate.toISOString()}&end=${endDate.toISOString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      console.warn('Device breakdown API not available');
      return [];
    }

    const data = await response.json();
    const deviceStats = data.devices || [];

    const breakdown: DeviceBreakdown[] = deviceStats.map((device: any) => ({
      device: capitalizeDeviceType(device.device_type),
      sessions: device.sessions_count || 0,
      users: device.users_count || 0,
      bounceRate: device.bounce_rate || 0,
      avgSessionDuration: device.avg_session_duration || 0,
    }));

    return breakdown.sort((a, b) => b.sessions - a.sessions);

  } catch (error) {
    console.error('Error fetching device breakdown:', error);
    return [];
  }
}

// Get browser breakdown within device types
export async function getBrowserBreakdown(
  deviceType?: string,
  timeFrame?: "monthly" | "yearly" | (string & {}),
): Promise<Array<{ browser: string; sessions: number; percentage: number }>> {
  try {
    // SERVER-SIDE SAFETY CHECK
    if (typeof window === 'undefined') {
      return [];
    }

    const endDate = new Date();
    let startDate = new Date();
    
    if (timeFrame === "yearly") {
      startDate.setFullYear(endDate.getFullYear() - 1);
    } else {
      startDate.setMonth(endDate.getMonth() - 1);
    }

    let apiUrl = `/api/analytics/devices?start=${startDate.toISOString()}&end=${endDate.toISOString()}`;
    if (deviceType) {
      apiUrl += `&device=${deviceType}`;
    }

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      console.warn('Browser breakdown API not available');
      return [];
    }

    const data = await response.json();
    const devices = data.devices || [];
    
    // Group by browser
    const browserMap = new Map<string, number>();
    let totalSessions = 0;

    devices.forEach((device: any) => {
      const browser = device.browser || 'Unknown';
      const sessions = device.sessions_count || 0;
      
      browserMap.set(browser, (browserMap.get(browser) || 0) + sessions);
      totalSessions += sessions;
    });

    // Convert to array with percentages
    return Array.from(browserMap.entries())
      .map(([browser, sessions]) => ({
        browser,
        sessions,
        percentage: totalSessions > 0 ? (sessions / totalSessions) * 100 : 0
      }))
      .sort((a, b) => b.sessions - a.sessions);

  } catch (error) {
    console.error('Error fetching browser breakdown:', error);
    return [];
  }
}

// Get operating system breakdown
export async function getOSBreakdown(
  timeFrame?: "monthly" | "yearly" | (string & {}),
): Promise<Array<{ os: string; sessions: number; percentage: number }>> {
  try {
    // SERVER-SIDE SAFETY CHECK
    if (typeof window === 'undefined') {
      return [];
    }

    const endDate = new Date();
    let startDate = new Date();
    
    if (timeFrame === "yearly") {
      startDate.setFullYear(endDate.getFullYear() - 1);
    } else {
      startDate.setMonth(endDate.getMonth() - 1);
    }

    const response = await fetch(`/api/analytics/devices?start=${startDate.toISOString()}&end=${endDate.toISOString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      console.warn('OS breakdown API not available');
      return [];
    }

    const data = await response.json();
    const devices = data.devices || [];
    
    // Group by OS
    const osMap = new Map<string, number>();
    let totalSessions = 0;

    devices.forEach((device: any) => {
      const os = device.os || 'Unknown';
      const sessions = device.sessions_count || 0;
      
      osMap.set(os, (osMap.get(os) || 0) + sessions);
      totalSessions += sessions;
    });

    // Convert to array with percentages
    return Array.from(osMap.entries())
      .map(([os, sessions]) => ({
        os,
        sessions,
        percentage: totalSessions > 0 ? (sessions / totalSessions) * 100 : 0
      }))
      .sort((a, b) => b.sessions - a.sessions);

  } catch (error) {
    console.error('Error fetching OS breakdown:', error);
    return [];
  }
}

// Get device performance comparison
export async function getDevicePerformance(
  timeFrame?: "monthly" | "yearly" | (string & {}),
): Promise<Array<{
  device: string;
  avgLoadTime: number;
  bounceRate: number;
  conversionRate: number;
  engagement: 'high' | 'medium' | 'low';
}>> {
  try {
    // SERVER-SIDE SAFETY CHECK
    if (typeof window === 'undefined') {
      return [];
    }

    const endDate = new Date();
    let startDate = new Date();
    
    if (timeFrame === "yearly") {
      startDate.setFullYear(endDate.getFullYear() - 1);
    } else {
      startDate.setMonth(endDate.getMonth() - 1);
    }

    // This would need additional API endpoints for performance metrics
    // For now, return basic structure
    const response = await fetch(`/api/analytics/devices?start=${startDate.toISOString()}&end=${endDate.toISOString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const devices = data.devices || [];

    return devices.map((device: any) => ({
      device: capitalizeDeviceType(device.device_type),
      avgLoadTime: 0, // Would need performance data
      bounceRate: device.bounce_rate || 0,
      conversionRate: 0, // Would need conversion data
      engagement: device.bounce_rate < 30 ? 'high' as const : 
                 device.bounce_rate < 60 ? 'medium' as const : 'low' as const
    }));

  } catch (error) {
    console.error('Error fetching device performance:', error);
    return [];
  }
}

// Helper function to format device type names
function capitalizeDeviceType(deviceType: string): string {
  const typeMap: Record<string, string> = {
    'desktop': 'Desktop',
    'mobile': 'Mobile', 
    'tablet': 'Tablet',
    'bot': 'Bots',
    'unknown': 'Unknown'
  };
  
  return typeMap[deviceType?.toLowerCase()] || 'Unknown';
}

// Helper function to get device icon
export function getDeviceIcon(deviceType: string): string {
  const iconMap: Record<string, string> = {
    'Desktop': '🖥️',
    'Mobile': '📱',
    'Tablet': '📱',
    'Bots': '🤖',
    'Unknown': '❓'
  };
  
  return iconMap[deviceType] || '❓';
}

// Helper function to get device color for charts
export function getDeviceColor(deviceType: string): string {
  const colorMap: Record<string, string> = {
    'Desktop': '#3B82F6', // Blue
    'Mobile': '#10B981',  // Green
    'Tablet': '#F59E0B',  // Orange
    'Bots': '#6B7280',    // Gray
    'Unknown': '#9CA3AF'  // Light Gray
  };
  
  return colorMap[deviceType] || '#9CA3AF';
}