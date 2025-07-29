import { useState, useEffect } from "react";
import { useTheme } from "@/app/provider";
import { CheckCircle2, Circle, ArrowRight, RefreshCw, Calendar, Check, X } from "lucide-react";
import UniversalExportButton, { ExportTemplate } from "@/components/UniversalExportButton";
import { exportTemplates } from "@/lib/exportUtils";

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

interface BusinessCleaningRecord {
  business_id: number;
  business_name: string;
  address: string;
  cleaned_dates: number[];
}

interface CleanTrackProps {
  cleanTrack: CleanTrackItem[];
  currentInstance: DailyInstance | null;
  currentDay: string;
  week: number;
  instanceLoading: boolean;
  onToggleBusinessStatus: (businessId: number) => void;
  onMoveBusinessToDate: (businessId: number, date: string) => void;
  onRefreshInstance: () => void;
}

export default function CleanTrack({
  cleanTrack,
  currentInstance,
  currentDay,
  week,
  instanceLoading,
  onToggleBusinessStatus,
  onMoveBusinessToDate,
  onRefreshInstance
}: CleanTrackProps) {
  const { themeType } = useTheme();
  const isDark = themeType === "dark";

  const [movingBusiness, setMovingBusiness] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [billingData, setBillingData] = useState<BusinessCleaningRecord[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const completed = cleanTrack.filter(item => item.status === "cleaned").length;
  const moved = cleanTrack.filter(item => item.status === "moved").length;
  const pending = cleanTrack.filter(item => item.status === "pending").length;

  // Load billing data for current month when component mounts
  useEffect(() => {
    loadBillingData();
  }, [currentInstance]);

  const loadBillingData = async () => {
    if (!currentInstance) return;

    try {
      const instanceDate = new Date(currentInstance.instance_date);
      const month = instanceDate.getMonth() + 1;
      const year = instanceDate.getFullYear();
      
      setCurrentMonth(month);
      setCurrentYear(year);

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      console.log(`📊 Loading billing data for ${month}/${year}`);

      // Fetch all businesses
      const businessesRes = await fetch('/api/schedule/businesses');
      if (!businessesRes.ok) throw new Error('Failed to fetch businesses');
      const allBusinesses = await businessesRes.json();

      // Fetch monthly instances
      const instancesRes = await fetch(
        `/api/schedule/daily-instances/monthly?start_date=${startDateStr}&end_date=${endDateStr}`
      );
      if (!instancesRes.ok) throw new Error('Failed to fetch monthly data');
      const monthlyData = await instancesRes.json();

      // Process data to create billing records
      const businessRecords = new Map<number, BusinessCleaningRecord>();

      // Initialize all businesses
      allBusinesses.forEach((business: any) => {
        businessRecords.set(business.id, {
          business_id: business.id,
          business_name: business.business_name,
          address: business.address,
          cleaned_dates: []
        });
      });

      // Process monthly instances to mark cleaned dates
      monthlyData.instances?.forEach((instance: any) => {
        const instanceDate = new Date(instance.instance_date);
        const dayOfMonth = instanceDate.getDate();

        instance.daily_clean_items?.forEach((item: any) => {
          if (item.status === 'cleaned') {
            const record = businessRecords.get(item.business_id);
            if (record && !record.cleaned_dates.includes(dayOfMonth)) {
              record.cleaned_dates.push(dayOfMonth);
            }
          }
        });
      });

      const processedData = Array.from(businessRecords.values())
        .sort((a, b) => a.business_name.localeCompare(b.business_name));

      setBillingData(processedData);
      console.log(`✅ Loaded billing data: ${processedData.length} businesses`);

    } catch (error) {
      console.error('❌ Error loading billing data:', error);
    }
  };

  const handleMoveClick = (businessId: number) => {
    setMovingBusiness(businessId);
    setSelectedDate("");
  };

  const handleDateConfirm = () => {
    if (movingBusiness && selectedDate) {
      onMoveBusinessToDate(movingBusiness, selectedDate);
      setMovingBusiness(null);
      setSelectedDate("");
    }
  };

  const handleCancelMove = () => {
    setMovingBusiness(null);
    setSelectedDate("");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "cleaned":
        return <CheckCircle2 size={20} className="text-green-600" />;
      case "moved":
        return <ArrowRight size={20} className="text-yellow-600" />;
      default:
        return <Circle size={20} className="text-[hsl(var(--muted-foreground))]" />;
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

  // Create export template for CMS billing
  const billingTemplate: ExportTemplate = {
    id: 'cms-billing-from-track',
    name: 'CMS Billing Report',
    data: {
      businesses: billingData,
      month: currentMonth,
      year: currentYear,
      generated_from: 'clean_track',
      instance_info: currentInstance ? {
        id: currentInstance.id,
        date: currentInstance.instance_date,
        day: currentInstance.day_name
      } : null
    },
    generator: async (data: any, format: 'excel' | 'pdf') => {
      const { businesses, month, year } = data;
      
      console.log(`🔄 Generating ${format.toUpperCase()} billing report from Clean Track`);
      console.log(`📊 Data: ${businesses.length} businesses, ${month}/${year}`);
      
      if (format === 'excel') {
        return await exportTemplates.billing.excel(businesses, month, year);
      } else {
        return await exportTemplates.billing.pdf(businesses, month, year);
      }
    }
  };

  const getMonthName = () => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[currentMonth - 1] || '';
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

              {/* Move Flow */}
              {item.status === "pending" && (
                <div className="flex items-center space-x-2">
                  {movingBusiness === item.business_id ? (
                    <>
                      {/* Date Selection UI */}
                      <div className="flex items-center space-x-2 animate-in slide-in-from-right-2">
                        <Calendar size={16} className="text-[hsl(var(--muted-foreground))]" />
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="px-2 py-1 text-sm border border-[hsl(var(--border))] rounded bg-[hsl(var(--input))] text-[hsl(var(--foreground))]"
                          min={new Date().toISOString().split('T')[0]}
                          autoFocus
                        />
                        <button
                          onClick={handleDateConfirm}
                          disabled={!selectedDate}
                          className={`p-2 rounded transition-colors ${
                            selectedDate
                              ? "bg-green-600 text-white hover:bg-green-700"
                              : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] cursor-not-allowed"
                          }`}
                          title="Confirm move"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={handleCancelMove}
                          className="p-2 bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] rounded hover:bg-[hsl(var(--secondary))] transition-colors"
                          title="Cancel move"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => handleMoveClick(item.business_id)}
                      className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                    >
                      Move
                    </button>
                  )}
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
          
          {/* Universal Export Button for CMS Billing */}
          {billingData.length > 0 && currentInstance && (
            <UniversalExportButton
              template={billingTemplate}
              filename={`CMS_Billing_${getMonthName()}_${currentYear}_from_CleanTrack`}
              disabled={instanceLoading}
              size="md"
              variant="primary"
              className="ml-4"
            />
          )}
        </div>
        
        {billingData.length > 0 && (
          <div className="mt-3 text-xs text-[hsl(var(--muted-foreground))]">
            💡 Export includes all {billingData.length} businesses for {getMonthName()} {currentYear}
          </div>
        )}
      </div>
    </div>
  );
}