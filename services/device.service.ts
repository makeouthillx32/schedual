// services/device.service.ts
export async function getDevicesUsedData(
  timeFrame?: "monthly" | "yearly" | (string & {}),
) {
  // Map timeFrame to days for API
  const days = timeFrame === "yearly" ? 365 : 30;
  
  // Use absolute URL for server-side fetch
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const url = `${baseUrl}/api/analytics/devices?days=${days}`;
  
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    // Important for server-side fetch
    cache: 'no-store'
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch device analytics: ${res.status} ${res.statusText}`);
  }
  
  const { devices, meta } = await res.json();
  
  // Group devices by type and sum their counts
  const deviceMap = new Map();
  
  devices.forEach((device: any) => {
    const deviceType = device.device_type.charAt(0).toUpperCase() + device.device_type.slice(1);
    
    if (!deviceMap.has(deviceType)) {
      deviceMap.set(deviceType, {
        name: deviceType,
        amount: 0,
        percentage: 0
      });
    }
    
    const existing = deviceMap.get(deviceType);
    existing.amount += device.page_views_count;
  });
  
  // Convert to array and calculate percentages
  const data = Array.from(deviceMap.values());
  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);
  
  // Calculate percentages and round to whole numbers
  data.forEach(item => {
    const rawPercentage = totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0;
    item.percentage = Math.round(rawPercentage); // Round to whole number
  });
  
  // Sort by amount descending
  data.sort((a, b) => b.amount - a.amount);
  
  return data;
}