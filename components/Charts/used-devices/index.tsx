import { PeriodPicker } from "@/components/period-picker";
import { cn } from "@/lib/utils";
import { getDevicesUsedData, getBrowserUsedData, getOperatingSystemData } from "@/services/device.service";
import { DonutChart } from "./chart";
import { TabbedDonutChart } from "./tabbed-chart";

type PropsType = {
  timeFrame?: string;
  className?: string;
  variant?: 'simple' | 'tabbed'; // Add variant prop to choose chart type
};

export async function UsedDevices({
  timeFrame = "monthly",
  className,
  variant = 'tabbed', // Default to tabbed for enhanced experience
}: PropsType) {
  
  if (variant === 'simple') {
    // SIMPLE VERSION: Just device data with original chart
    const data = await getDevicesUsedData(timeFrame);

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
          <DonutChart data={data} />
        </div>
      </div>
    );
  }

  // TABBED VERSION: Enhanced with devices, browsers, and OS
  const [deviceData, browserData, osData] = await Promise.all([
    getDevicesUsedData(timeFrame),
    getBrowserUsedData(timeFrame),
    getOperatingSystemData(timeFrame),
  ]);

  return (
    <div
      className={cn(
        "grid grid-cols-1 grid-rows-[auto_1fr] gap-9 rounded-[calc(var(--radius)*1.25)] bg-[hsl(var(--card))] p-7.5 shadow-[var(--shadow-sm)] dark:bg-[hsl(var(--card))] dark:shadow-[var(--shadow-md)]",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-body-2xlg font-bold text-[hsl(var(--foreground))] dark:text-[hsl(var(--foreground))]">
          Device Analytics
        </h2>

        <PeriodPicker defaultValue={timeFrame} sectionKey="used_devices" />
      </div>

      <div className="grid place-items-center">
        <TabbedDonutChart 
          deviceData={deviceData}
          browserData={browserData}
          osData={osData}
        />
      </div>
    </div>
  );
}