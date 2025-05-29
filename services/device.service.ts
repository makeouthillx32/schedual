// services/device.service.ts - SERVER COMPATIBLE
export async function getDevicesUsedData(
  timeFrame?: "monthly" | "yearly" | (string & {}),
) {
  try {
    console.log('🔍 [DEVICES] Service called with timeFrame:', timeFrame);

    // Calculate date range
    const endDate = new Date();
    let startDate = new Date();
    
    if (timeFrame === "yearly") {
      startDate.setFullYear(endDate.getFullYear() - 1);
    } else {
      startDate.setMonth(endDate.getMonth() - 1);
    }

    // Build API URL
    let apiUrl: string;
    
    if (typeof window === 'undefined') {
      // SERVER-SIDE: Use full URL
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      apiUrl = `${baseUrl}/api/analytics/devices?start=${startDate.toISOString()}&end=${endDate.toISOString()}`;
      console.log('🏢 [DEVICES] Server-side API call:', apiUrl);
    } else {
      // CLIENT-SIDE: Use relative URL
      apiUrl = `/api/analytics/devices?start=${startDate.toISOString()}&end=${endDate.toISOString()}`;
      console.log('🌐 [DEVICES] Client-side API call:', apiUrl);
    }

    console.log('📡 [DEVICES] Making fetch request...');
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      console.warn('⚠️ [DEVICES] API failed:', response.status, response.statusText);
      return [];
    }

    const apiData = await response.json();
    console.log('📊 [DEVICES] API response:', apiData);
    
    // Extract devices from API response
    const deviceStats = apiData.devices || [];
    console.log('📱 [DEVICES] Device stats:', deviceStats);

    if (deviceStats.length === 0) {
      console.warn('📭 [DEVICES] No device data found');
      return [];
    }

    // Transform API data to chart format: { name: string, amount: number }[]
    const chartData = deviceStats.map((device: any) => ({
      name: capitalizeDeviceType(device.device_type),
      amount: device.sessions_count || 0
    }));

    // Sort by amount (highest first) 
    chartData.sort((a: any, b: any) => b.amount - a.amount);

    console.log('✅ [DEVICES] Final chart data:', chartData);
    console.log('🎯 [DEVICES] Total sessions:', chartData.reduce((sum: number, d: any) => sum + d.amount, 0));

    return chartData;

  } catch (error) {
    console.error('❌ [DEVICES] Error:', error);
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