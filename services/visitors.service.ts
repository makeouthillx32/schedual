export async function getDevicesUsedData(
  timeFrame?: "monthly" | "yearly" | (string & {}),
) {
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
      console.warn('Device analytics API not available');
      return [];
    }

    const data = await response.json();
    
    // Transform the API response to match the expected format
    const deviceStats = data.devices || [];
    const totalSessions = deviceStats.reduce((sum: number, device: any) => sum + (device.sessions_count || 0), 0);
    
    // Map to the expected format
    const result = deviceStats.map((device: any) => ({
      name: capitalizeDeviceType(device.device_type),
      percentage: totalSessions > 0 ? (device.sessions_count || 0) / totalSessions : 0,
      amount: device.sessions_count || 0,
    }));

    // Sort by amount (highest first)
    result.sort((a, b) => b.amount - a.amount);

    // If no data, return empty array
    if (result.length === 0) {
      console.info('No device analytics data available yet');
      return [];
    }

    return result;

  } catch (error) {
    console.error('Error fetching device analytics:', error);
    
    // Return empty array on error (no more dummy data!)
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