// services/devices.service.ts - FINAL CHART COMPATIBLE VERSION
export async function getDevicesUsedData(
  timeFrame?: "monthly" | "yearly" | (string & {}),
) {
  try {
    console.log('🔍 [DEVICES] Service called with timeFrame:', timeFrame);

    // SERVER-SIDE SAFETY CHECK 
    if (typeof window === 'undefined') {
      console.log('🏢 [DEVICES] Server-side rendering');
      return [];
    }

    // Calculate date range
    const endDate = new Date();
    let startDate = new Date();
    
    if (timeFrame === "yearly") {
      startDate.setFullYear(endDate.getFullYear() - 1);
    } else {
      startDate.setMonth(endDate.getMonth() - 1);
    }

    const apiUrl = `/api/analytics/devices?start=${startDate.toISOString()}&end=${endDate.toISOString()}`;
    console.log('🌐 [DEVICES] Calling API:', apiUrl);

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      console.warn('⚠️ [DEVICES] API failed:', response.status);
      return [];
    }

    const apiData = await response.json();
    console.log('📊 [DEVICES] Raw API response:', apiData);
    
    // Extract devices from API response
    const deviceStats = apiData.devices || [];
    console.log('📱 [DEVICES] Device stats array:', deviceStats);

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
    console.log('🎯 [DEVICES] Summary:', {
      deviceCount: chartData.length,
      totalSessions: chartData.reduce((sum: number, d: any) => sum + d.amount, 0),
      topDevice: chartData[0]?.name,
      topDeviceSessions: chartData[0]?.amount
    });

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
  
  const result = typeMap[deviceType?.toLowerCase()] || 'Unknown';
  console.log('🔤 [DEVICES] Mapped', deviceType, '->', result);
  return result;
}