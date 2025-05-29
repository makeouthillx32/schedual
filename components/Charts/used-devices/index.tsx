import { PeriodPicker } from "@/components/period-picker";
import { cn } from "@/lib/utils";
import { getDevicesUsedData } from "@/services/device.service”; // Fixed import path
import { DonutChart } from "./chart";

type PropsType = {
  timeFrame?: string;
  className?: string;
};

export async function UsedDevices({
  timeFrame = "monthly",
  className,
}: PropsType) {
  console.log('🏠 [INDEX] === USED DEVICES COMPONENT ===');
  console.log('🏠 [INDEX] timeFrame:', timeFrame);
  console.log('🏠 [INDEX] Calling getDevicesUsedData...');
  
  const data = await getDevicesUsedData(timeFrame);
  
  console.log('🏠 [INDEX] === DATA RECEIVED FROM SERVICE ===');
  console.log('🏠 [INDEX] Data:', data);
  console.log('🏠 [INDEX] Data type:', typeof data);
  console.log('🏠 [INDEX] Data length:', Array.isArray(data) ? data.length : 'not an array');
  console.log('🏠 [INDEX] Is array:', Array.isArray(data));
  
  if (Array.isArray(data) && data.length > 0) {
    console.log('🏠 [INDEX] First item:', data[0]);
    console.log('🏠 [INDEX] Data structure check:');
    data.forEach((item, index) => {
      console.log(`🏠 [INDEX] Item ${index}:`, {
        name: item?.name,
        amount: item?.amount,
        hasName: 'name' in item,
        hasAmount: 'amount' in item
      });
    });
  } else {
    console.warn('🏠 [INDEX] Data is empty or not an array!');
  }
  
  console.log('🏠 [INDEX] Passing data to DonutChart...');

  return (
    <div
      className={cn(
        "grid grid-cols-1 grid-rows-[auto_1fr] gap-9 rounded-[calc(var(--radius)*1.25)] bg-[hsl(var(--card))] p-7.5 shadow-[var(--shadow-sm)] dark:bg-[hsl(var(--card))] dark:shadow-[var(--shadow-md)]",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-body-2xlg font-bold text-[hsl(var(--foreground))] dark:text-[hsl(var(--foreground))]">
          Used Devices
        </h2>

        <PeriodPicker defaultValue={timeFrame} sectionKey="used_devices" />
      </div>

      <div className="grid place-items-center">
        {/* Show raw data for debugging */}
        <div className="text-xs text-gray-500 mb-2">
          Debug: {Array.isArray(data) ? data.length : 0} items, Total: {Array.isArray(data) ? data.reduce((sum, d) => sum + (d?.amount || 0), 0) : 0}
        </div>
        <DonutChart data={data} />
      </div>
    </div>
  );
}