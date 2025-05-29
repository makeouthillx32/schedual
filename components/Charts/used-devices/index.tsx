// Minimal debug version of your index
import { PeriodPicker } from "@/components/period-picker";
import { cn } from "@/lib/utils";

type PropsType = {
  timeFrame?: string;
  className?: string;
};

export async function UsedDevices({
  timeFrame = "monthly",
  className,
}: PropsType) {
  // TEMPORARILY REMOVE SERVICE CALLS TO TEST
  console.log('🏠 [INDEX] Starting UsedDevices component');
  
  try {
    // Dummy data to test component rendering
    const deviceData = [
      { name: "Desktop", amount: 21 },
      { name: "Mobile", amount: 1 }
    ];
    
    console.log('🏠 [INDEX] Using dummy data for testing');

    return (
      <div
        className={cn(
          "grid grid-cols-1 grid-rows-[auto_1fr] gap-9 rounded-[calc(var(--radius)*1.25)] bg-[hsl(var(--card))] p-7.5 shadow-[var(--shadow-sm)] dark:bg-[hsl(var(--card))] dark:shadow-[var(--shadow-md)]",
          className,
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-body-2xlg font-bold text-[hsl(var(--foreground))] dark:text-[hsl(var(--foreground))]">
            Device Analytics (Debug Mode)
          </h2>

          <PeriodPicker defaultValue={timeFrame} sectionKey="used_devices" />
        </div>

        <div className="grid place-items-center">
          <div className="text-center p-8">
            <div className="text-2xl mb-4">🔧 Debug Mode</div>
            <div className="text-sm text-gray-600">
              Component loads successfully with dummy data:<br/>
              Desktop: {deviceData[0].amount} sessions<br/>
              Mobile: {deviceData[1].amount} sessions
            </div>
          </div>
        </div>
      </div>
    );
    
  } catch (error) {
    console.error('❌ [INDEX] Error in UsedDevices:', error);
    
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded">
        <h3 className="text-red-800 font-bold">Debug Error</h3>
        <p className="text-red-600 text-sm">
          Error in UsedDevices component: {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }
}