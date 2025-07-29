import { useTheme } from "@/app/provider";
import { CheckCircle2, Circle, ArrowRight, RefreshCw } from "lucide-react";

interface CleanTrackItem {
  id?: number;
  business_id: number;
  business_name: string;
  address: string;
  before_open: boolean;
  status: "pending" | "cleaned" | "missed" | "moved";
  cleaned_at?: string;
  moved_to_date?: string;
  notes?: string;
  marked_by?: string;
  updated_at?: string;
}

interface DailyInstance {
  id: number;
  instance_date: string;
  week_number: number;
  day_name: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface CleanTrackProps {
  cleanTrack: CleanTrackItem[];
  currentInstance: DailyInstance | null;
  currentDay: string;
  week: number;
  instanceLoading: boolean;
  moveToDate: { [key: number]: string };
  onToggleBusinessStatus: (businessId: number) => void;
  onMoveBusinessToDate: (businessId: number) => void;
  onDateChange: (businessId: number, date: string) => void;
  onRefreshInstance: () => void;
}

export default function CleanTrack({
  cleanTrack,
  currentInstance,
  currentDay,
  week,
  instanceLoading,
  moveToDate,
  onToggleBusinessStatus,
  onMoveBusinessToDate,
  onDateChange,
  onRefreshInstance
}: CleanTrackProps) {
  const { themeType } = useTheme();
  const isDark = themeType === "dark";

  const completed = cleanTrack.filter(item => item.status === "cleaned").length;
  const moved = cleanTrack.filter(item => item.status === "moved").length;
  const pending = cleanTrack.filter(item => item.status === "pending").length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "cleaned":
        return <CheckCircle2 size={20} className="text-green-600" />;
      case "moved":
        return <ArrowRight size={20} className="text-yellow-600" />;
      default:
        return <Circle size={20} className="text-gray-400" />;
    }
  };

  const getStatusText = (item: CleanTrackItem) => {
    switch (item.status) {
      case "cleaned":
        return (
          <span className="text-green-600 font-medium">
            ✓ Cleaned {item.cleaned_at && `at ${new Date(item.cleaned_at).toLocaleTimeString()}`}
          </span>
        );
      case "moved":
        return (
          <span className="text-yellow-600 font-medium">
            → Moved to {item.moved_to_date && new Date(item.moved_to_date).toLocaleDateString()}
          </span>
        );
      default:
        return <span className="text-[hsl(var(--muted-foreground))]">Pending</span>;
    }
  };

  return (
    <div
      className={`rounded-lg p-4 ${
        isDark
          ? "bg-[hsl(var(--card))] shadow-[var(--shadow-md)]"
          : "bg-[hsl(var(--background))] shadow-[var(--shadow-sm)]"
      }`}
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center">
            <CheckCircle2 size={24} className="mr-2 text-[hsl(var(--sidebar-primary))]" />
            Clean Track - {currentDay.charAt(0).toUpperCase() + currentDay.slice(1)}
          </h3>
          <div className="flex items-center space-x-2">
            {currentInstance && (
              <div className="text-sm text-[hsl(var(--muted-foreground))]">
                Instance #{currentInstance.id}
              </div>
            )}
            <button
              onClick={onRefreshInstance}
              disabled={instanceLoading}
              className="p-2 hover:bg-[hsl(var(--secondary))] rounded transition-colors"
              title="Refresh data"
            >
              <RefreshCw size={16} className={instanceLoading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
        
        {currentInstance && (
          <div className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
            <div className="flex items-center space-x-4">
              <span>📅 {new Date(currentInstance.instance_date).toLocaleDateString()}</span>
              <span>👥 Shared with team</span>
              <span>🔄 Last updated: {new Date(currentInstance.updated_at).toLocaleTimeString()}</span>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className={`p-3 rounded-lg text-center ${
            isDark ? "bg-[hsl(var(--secondary))]" : "bg-[hsl(var(--muted))]"
          }`}>
            <div className="text-2xl font-bold text-green-600">{completed}</div>
            <div className="text-sm text-[hsl(var(--muted-foreground))]">Cleaned</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${
            isDark ? "bg-[hsl(var(--secondary))]" : "bg-[hsl(var(--muted))]"
          }`}>
            <div className="text-2xl font-bold text-[hsl(var(--muted-foreground))]">{pending}</div>
            <div className="text-sm text-[hsl(var(--muted-foreground))]">Pending</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${
            isDark ? "bg-[hsl(var(--secondary))]" : "bg-[hsl(var(--muted))]"
          }`}>
            <div className="text-2xl font-bold text-yellow-600">{moved}</div>
            <div className="text-sm text-[hsl(var(--muted-foreground))]">Moved</div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {cleanTrack.map((item) => (
          <div
            key={item.business_id}
            className={`p-4 rounded-lg border border-[hsl(var(--border))] transition-all ${
              isDark
                ? "bg-[hsl(var(--card))]"
                : "bg-[hsl(var(--background))]"
            } ${
              item.status === "cleaned" 
                ? "border-green-200 bg-green-50/50" 
                : item.status === "moved"
                ? "border-yellow-200 bg-yellow-50/50"
                : ""
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <button
                  onClick={() => onToggleBusinessStatus(item.business_id)}
                  className="mt-1 hover:scale-110 transition-transform"
                  disabled={item.status === "moved"}
                >
                  {getStatusIcon(item.status)}
                </button>

                <div className="flex-1">
                  <h4 className="font-semibold text-[hsl(var(--foreground))]">
                    {item.business_name}
                  </h4>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">
                    {item.address}
                  </p>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.before_open 
                        ? "bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]" 
                        : "bg-[hsl(var(--chart-2))]/10 text-[hsl(var(--chart-2))]"
                    }`}>
                      {item.before_open ? "Before Open" : "After Close"}
                    </span>
                    {getStatusText(item)}
                  </div>
                </div>
              </div>

              {item.status === "pending" && (
                <div className="flex items-center space-x-2">
                  <input
                    type="date"
                    value={moveToDate[item.business_id] || ""}
                    onChange={(e) => onDateChange(item.business_id, e.target.value)}
                    className="px-2 py-1 text-sm border border-[hsl(var(--border))] rounded bg-[hsl(var(--input))] text-[hsl(var(--foreground))]"
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <button
                    onClick={() => onMoveBusinessToDate(item.business_id)}
                    disabled={!moveToDate[item.business_id]}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      moveToDate[item.business_id]
                        ? "bg-yellow-600 text-white hover:bg-yellow-700"
                        : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] cursor-not-allowed"
                    }`}
                  >
                    Move
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 border-t border-[hsl(var(--border))]">
        <div className="flex items-center justify-between">
          <div className="text-sm text-[hsl(var(--muted-foreground))]">
            Progress: {completed} of {cleanTrack.length} completed
            {moved > 0 && ` • ${moved} moved to future dates`}
          </div>
          <button
            className="px-4 py-2 bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] rounded hover:bg-[hsl(var(--sidebar-primary))]/90 transition-colors"
            onClick={() => {
              console.log("📊 Clean Track Report:", {
                date: new Date().toISOString().split('T')[0],
                day: currentDay,
                week: week,
                summary: { completed, pending, moved },
                details: cleanTrack
              });
              alert(`Daily Report Generated!\n\nCompleted: ${completed}\nPending: ${pending}\nMoved: ${moved}\n\nCheck console for full details.`);
            }}
          >
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
}