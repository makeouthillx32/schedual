// services/devices.service.ts - SUPER DEBUG VERSION
export async function getDevicesUsedData(
  timeFrame?: "monthly" | "yearly" | (string & {}),
) {
  console.log('🚀 [DEVICES] === SERVICE CALLED ===');
  console.log('🚀 [DEVICES] timeFrame:', timeFrame);
  console.log('🚀 [DEVICES] typeof window:', typeof window);
  
  try {
    // SERVER-SIDE SAFETY CHECK 
    if (typeof window === 'undefined') {
      console.log('🏢 [DEVICES] Server-side rendering - returning empty array');
      return [];
    }

    console.log('🌐 [DEVICES] Client-side - proceeding with API call');

    // Calculate date range
    const endDate = new Date();
    let startDate = new Date();
    
    if (timeFrame === "yearly") {
      startDate.setFullYear(endDate.getFullYear() - 1);
    } else {
      startDate.setMonth(endDate.getMonth() - 1);
    }

    const apiUrl = `/api/analytics/devices?start=${startDate.toISOString()}&end=${endDate.toISOString()}`;
    console.log('🌐 [DEVICES] API URL constructed:', apiUrl);
    console.log('🌐 [DEVICES] Date range:', {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    });

    console.log('📡 [DEVICES] Making fetch request...');
    const response = await fetch(apiUrl);
    console.log('📡 [DEVICES] Response received:', {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText
    });
    
    if (!response.ok) {
      console.error('❌ [DEVICES] API request failed:', {
        status: response.status,
        statusText: response.statusText
      });
      
      // Try to read error response
      try {
        const errorText = await response.text();
        console.error('❌ [DEVICES] Error response body:', errorText);
      } catch (e) {
        console.error('❌ [DEVICES] Could not read error response');
      }
      
      return [];
    }

    console.log('📊 [DEVICES] Parsing JSON response...');
    const apiData = await response.json();
    console.log('📊 [DEVICES] === FULL API RESPONSE ===');
    console.log(JSON.stringify(apiData, null, 2));
    console.log('📊 [DEVICES] === END API RESPONSE ===');
    
    // Extract devices from API response
    const deviceStats = apiData.devices || [];
    console.log('📱 [DEVICES] Extracted devices array:', deviceStats);
    console.log('📱 [DEVICES] Device stats length:', deviceStats.length);

    if (deviceStats.length === 0) {
      console.warn('📭 [DEVICES] No device data found in API response');
      console.warn('📭 [DEVICES] API response structure:', Object.keys(apiData));
      return [];
    }

    console.log('🔄 [DEVICES] Processing each device...');
    
    // Transform API data to chart format
    const chartData = deviceStats.map((device: any, index: number) => {
      console.log(`🔄 [DEVICES] Processing device ${index}:`, device);
      
      const name = capitalizeDeviceType(device.device_type);
      const amount = device.sessions_count || 0;
      
      console.log(`🔄 [DEVICES] Transformed: ${device.device_type} -> ${name}, sessions: ${amount}`);
      
      return {
        name: name,
        amount: amount
      };
    });

    console.log('📊 [DEVICES] Raw chart data before filtering:', chartData);

    // Sort by amount (highest first) 
    chartData.sort((a: any, b: any) => b.amount - a.amount);
    console.log('📊 [DEVICES] Sorted chart data:', chartData);

    // Filter out zero amounts
    const filteredData = chartData.filter((item: any) => item.amount > 0);
    console.log('📊 [DEVICES] Filtered chart data (non-zero):', filteredData);

    console.log('✅ [DEVICES] === FINAL RESULT ===');
    console.log('✅ [DEVICES] Returning:', filteredData);
    console.log('✅ [DEVICES] Result length:', filteredData.length);
    console.log('✅ [DEVICES] Total sessions:', filteredData.reduce((sum: number, d: any) => sum + d.amount, 0));
    console.log('✅ [DEVICES] === END RESULT ===');

    // Return all data (including zeros) for debugging
    return chartData;

  } catch (error) {
    console.error('❌ [DEVICES] === ERROR CAUGHT ===');
    console.error('❌ [DEVICES] Error details:', error);
    console.error('❌ [DEVICES] Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('❌ [DEVICES] === END ERROR ===');
    return [];
  }
}

// Helper function to format device type names
function capitalizeDeviceType(deviceType: string): string {
  console.log('🔤 [DEVICES] Capitalizing:', deviceType);
  
  const typeMap: Record<string, string> = {
    'desktop': 'Desktop',
    'mobile': 'Mobile', 
    'tablet': 'Tablet',
    'bot': 'Bots',
    'unknown': 'Unknown'
  };
  
  const result = typeMap[deviceType?.toLowerCase()] || 'Unknown';
  console.log('🔤 [DEVICES] Result:', deviceType, '->', result);
  return result;
}