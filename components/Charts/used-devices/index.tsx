import { PeriodPicker } from "@/components/period-picker";
import { cn } from "@/lib/utils";
import { getDevicesUsedData, getBrowserUsedData, getOperatingSystemData } from "@/services/device.service";
import { DonutChart } from "./chart";
import { TabbedDonutChart } from "./tabbed-chart";

type PropsType = {
  timeFrame?: string;
  className?: string;
  variant?: 'simple' | 'tabbed';
};

export async function UsedDevices({
  timeFrame = "monthly",
  className,
  variant = 'simple', // Default to simple for safety
}: PropsType) {
  try {
    // Always fetch device data
    const deviceData = await getDevicesUsedData(timeFrame);

    // Simple version - just return original component
    if (variant === 'simple') {
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
            <DonutChart data={deviceData} />
          </div>
        </div>
      );
    }

    // Tabbed version - fetch additional data
    let browserData: any[] = [];
    let osData: any[] = [];

    try {
      browserData = await getBrowserUsedData(timeFrame);
    } catch (error) {
      console.error('Error fetching browser data:', error);
      browserData = [];
    }

    try {
      osData = await getOperatingSystemData(timeFrame);
    } catch (error) {
      console.error('Error fetching OS data:', error);
      osData = [];
    }

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

  } catch (error) {
    console.error('UsedDevices component error:', error);
    
    // Fallback UI on error
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

        <div className="grid place-items-center h-64">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">⚠️</div>
            <div>Unable to load device analytics</div>
            <div className="text-sm mt-1">Please try refreshing the page</div>
          </div>
        </div>
      </div>
    );
  }
}