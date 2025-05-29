// services/devices.service.ts - VERIFIED FOR YOUR DATA
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
    console.log('🌐 [DEVICES] Calling:', apiUrl);

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      console.warn('⚠️ [DEVICES] API failed:', response.status);
      return [];
    }

    const data = await response.json();
    console.log('📊 [DEVICES] API Response:', data);
    
    // Extract devices array from your API response
    const deviceStats = data.devices || [];
    console.log('📱 [DEVICES] Device stats:', deviceStats);

    if (deviceStats.length === 0) {
      console.warn('📭 [DEVICES] No device data');
      return [];
    }

    // Calculate total sessions
    const totalSessions = deviceStats.reduce((sum: number, device: any) => sum + (device.sessions_count || 0), 0);
    console.log('🔢 [DEVICES] Total sessions:', totalSessions);

    // Initialize all device types with zero values
    const deviceMap = new Map([
      ['Desktop', { name: 'Desktop', percentage: 0, amount: 0 }],
      ['Mobile', { name: 'Mobile', percentage: 0, amount: 0 }],
      ['Tablet', { name: 'Tablet', percentage: 0, amount: 0 }],
      ['Unknown', { name: 'Unknown', percentage: 0, amount: 0 }],
    ]);

    // Fill in actual data
    deviceStats.forEach((device: any) => {
      const deviceName = capitalizeDeviceType(device.device_type);
      const amount = device.sessions_count || 0;
      const percentage = totalSessions > 0 ? amount / totalSessions : 0;
      
      console.log(`🔄 [DEVICES] Processing: ${device.device_type} -> ${deviceName}`, {
        amount,
        percentage: Math.round(percentage * 100) + '%'
      });
      
      if (deviceMap.has(deviceName)) {
        deviceMap.set(deviceName, {
          name: deviceName,
          percentage: percentage,
          amount: amount,
        });
      } else {
        // Add to Unknown
        const unknown = deviceMap.get('Unknown')!;
        unknown.amount += amount;
        unknown.percentage = totalSessions > 0 ? unknown.amount / totalSessions : 0;
      }
    });

    // Convert to expected array format [Desktop, Mobile, Tablet, Unknown]
    const result = [
      deviceMap.get('Desktop')!,
      deviceMap.get('Mobile')!,
      deviceMap.get('Tablet')!,
      deviceMap.get('Unknown')!,
    ];

    console.log('✅ [DEVICES] Final result:', result);
    
    // Extra verification
    const verification = {
      totalDevices: result.length,
      totalAmount: result.reduce((sum, d) => sum + d.amount, 0),
      totalPercentage: result.reduce((sum, d) => sum + d.percentage, 0),
      hasData: result.some(d => d.amount > 0),
      nonZeroDevices: result.filter(d => d.amount > 0)
    };
    console.log('🎯 [DEVICES] Verification:', verification);

    return result;

  } catch (error) {
    console.error('❌ [DEVICES] Error:', error);
    return [];
  }
}

function capitalizeDeviceType(deviceType: string): string {
  const typeMap: Record<string, string> = {
    'desktop': 'Desktop',
    'mobile': 'Mobile', 
    'tablet': 'Tablet',
    'bot': 'Unknown',
    'unknown': 'Unknown'
  };
  
  return typeMap[deviceType?.toLowerCase()] || 'Unknown';
}