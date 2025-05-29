// services/device.service.ts - ENHANCED WITH BROWSER DATA
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
    return chartData;

  } catch (error) {
    console.error('❌ [DEVICES] Error:', error);
    return [];
  }
}

// NEW: Get browser usage data
export async function getBrowserUsedData(
  timeFrame?: "monthly" | "yearly" | (string & {}),
) {
  try {
    console.log('🔍 [BROWSERS] Service called with timeFrame:', timeFrame);

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
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      apiUrl = `${baseUrl}/api/analytics/devices?start=${startDate.toISOString()}&end=${endDate.toISOString()}`;
    } else {
      apiUrl = `/api/analytics/devices?start=${startDate.toISOString()}&end=${endDate.toISOString()}`;
    }

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      console.warn('⚠️ [BROWSERS] API failed:', response.status);
      return [];
    }

    const apiData = await response.json();
    const deviceStats = apiData.devices || [];

    if (deviceStats.length === 0) {
      console.warn('📭 [BROWSERS] No device data for browser analysis');
      return [];
    }

    // Group by browser (your API returns browser field)
    const browserMap = new Map<string, number>();
    
    deviceStats.forEach((device: any) => {
      const browser = device.browser || 'Unknown';
      const sessions = device.sessions_count || 0;
      
      browserMap.set(browser, (browserMap.get(browser) || 0) + sessions);
    });

    // Convert to chart format
    const browserData = Array.from(browserMap.entries()).map(([browser, sessions]) => ({
      name: browser,
      amount: sessions
    }));

    // Sort by amount (highest first)
    browserData.sort((a, b) => b.amount - a.amount);

    console.log('✅ [BROWSERS] Browser data:', browserData);
    return browserData;

  } catch (error) {
    console.error('❌ [BROWSERS] Error:', error);
    return [];
  }
}

// NEW: Get operating system data
export async function getOperatingSystemData(
  timeFrame?: "monthly" | "yearly" | (string & {}),
) {
  try {
    console.log('🔍 [OS] Service called with timeFrame:', timeFrame);

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
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      apiUrl = `${baseUrl}/api/analytics/devices?start=${startDate.toISOString()}&end=${endDate.toISOString()}`;
    } else {
      apiUrl = `/api/analytics/devices?start=${startDate.toISOString()}&end=${endDate.toISOString()}`;
    }

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      console.warn('⚠️ [OS] API failed:', response.status);
      return [];
    }

    const apiData = await response.json();
    const deviceStats = apiData.devices || [];

    if (deviceStats.length === 0) {
      console.warn('📭 [OS] No device data for OS analysis');
      return [];
    }

    // Group by operating system
    const osMap = new Map<string, number>();
    
    deviceStats.forEach((device: any) => {
      const os = device.os || 'Unknown';
      const sessions = device.sessions_count || 0;
      
      osMap.set(os, (osMap.get(os) || 0) + sessions);
    });

    // Convert to chart format
    const osData = Array.from(osMap.entries()).map(([os, sessions]) => ({
      name: os,
      amount: sessions
    }));

    // Sort by amount (highest first)
    osData.sort((a, b) => b.amount - a.amount);

    console.log('✅ [OS] Operating system data:', osData);
    return osData;

  } catch (error) {
    console.error('❌ [OS] Error:', error);
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