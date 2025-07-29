"use client";

import { useState, useEffect } from "react";
import { fetchSchedule } from "@/components/fetchSchedule";
import { assignRandomJobs } from "@/components/assignRandomJobs";
import Toast from "@/components/Toast";
import RandomizerButton from "@/components/RandomizerButton";
import WeatherWidget from "@/components/WeatherWidget";
import ScheduleList from "@/components/ScheduleList";
import { useTheme } from "@/app/provider";
import { Calendar, CheckCircle2, Circle, ArrowRight, RefreshCw } from "lucide-react";

interface JobSchedule {
  business_name: string;
  jobs: { job_name: string; member_name: string }[];
  before_open: boolean;
  address: string;
  business_id?: number;
  isCompleted?: boolean;
}

interface Member {
  id: number;
  name: string;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
}

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

const days = ["monday", "tuesday", "wednesday", "thursday", "friday"];

const Hero = () => {
  const { themeType } = useTheme();
  const isDark = themeType === "dark";

  const [week, setWeek] = useState(0);
  const [day, setDay] = useState("");
  const [schedule, setSchedule] = useState<JobSchedule[]>([]);
  const [membersList, setMembersList] = useState<Member[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [toastInfo, setToastInfo] = useState<{
    business_id?: number;
    business_name: string;
    before_open: boolean;
    address: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<"schedule" | "team" | "clean-track">("schedule");
  
  const [currentInstance, setCurrentInstance] = useState<DailyInstance | null>(null);
  const [cleanTrack, setCleanTrack] = useState<CleanTrackItem[]>([]);
  const [moveToDate, setMoveToDate] = useState<{ [key: number]: string }>({});
  const [instanceLoading, setInstanceLoading] = useState(false);

  useEffect(() => {
    fetch("/api/schedule/members")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load members");
        return res.json() as Promise<Member[]>;
      })
      .then(setMembersList)
      .catch(console.error);
  }, []);

  useEffect(() => {
    const today = new Date();
    setDay(
      today
        .toLocaleString("en-US", { weekday: "long" })
        .toLowerCase()
    );
    setWeek(Math.ceil(today.getDate() / 7));
  }, []);

  useEffect(() => {
    if (!day || week <= 0) return;

    const loadDailyData = async () => {
      setInstanceLoading(true);
      try {
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];

        const instanceRes = await fetch(
          `/api/schedule/daily-instances?date=${dateStr}&week=${week}&day=${day}`
        );
        
        if (!instanceRes.ok) {
          throw new Error("Failed to load daily instance");
        }

        const instanceData = await instanceRes.json();
        setCurrentInstance(instanceData.instance);
        setCleanTrack(instanceData.items || []);

        const scheduleData = await fetchSchedule(week, day);
        
        if (!scheduleData.schedule?.length) {
          setError("No businesses to clean today. Have a good day off!");
          setSchedule([]);
          return;
        }

        const available = membersList.filter(
          (m) => m[day as keyof Member]
        );

        const completedBusinessIds = new Set(
          instanceData.items
            ?.filter((item: CleanTrackItem) => item.status === "cleaned")
            ?.map((item: CleanTrackItem) => item.business_id) || []
        );

        const updated = scheduleData.schedule.map((entry: any) => {
          const isCompleted = completedBusinessIds.has(entry.business_id);
          
          return {
            ...entry,
            isCompleted,
            jobs: assignRandomJobs(
              ["Sweep and Mop", "Vacuum", "Bathrooms and Trash"],
              available
            ),
            onClick: () => {
              setToastInfo({
                business_id: entry.business_id,
                business_name: entry.business_name,
                before_open: entry.before_open,
                address: entry.address,
              });
            },
          };
        });

        setSchedule(updated);
        setError(null);

      } catch (err) {
        console.error("❌ Error loading daily data:", err);
        setError("Failed to load today's cleaning data");
        setSchedule([]);
        setCleanTrack([]);
      } finally {
        setInstanceLoading(false);
      }
    };

    loadDailyData();
  }, [week, day, membersList]);

  const randomizeSchedule = () => {
    const available = membersList.filter(
      (m) => m[day as keyof Member]
    );

    setSchedule((prev) =>
      prev.map((entry) => ({
        ...entry,
        jobs: assignRandomJobs(
          ["Sweep and Mop", "Vacuum", "Bathrooms and Trash"],
          available
        ),
      }))
    );
  };

  const updateBusinessStatus = async (businessId: number, status: string, movedDate?: string) => {
    if (!currentInstance) return;

    try {
      const updateData: any = {
        instance_id: currentInstance.id,
        business_id: businessId,
        status
      };

      if (status === "moved" && movedDate) {
        updateData.moved_to_date = movedDate;
      }

      const res = await fetch("/api/schedule/daily-instances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData)
      });

      if (!res.ok) {
        throw new Error("Failed to update business status");
      }

      const result = await res.json();

      setCleanTrack(prev => prev.map(item => 
        item.business_id === businessId 
          ? { ...item, ...result.item }
          : item
      ));

      setSchedule(prev => prev.map(entry => 
        entry.business_id === businessId 
          ? { ...entry, isCompleted: status === "cleaned" }
          : entry
      ));

    } catch (error) {
      console.error("❌ Error updating business status:", error);
      alert("Failed to update business status. Please try again.");
    }
  };

  const toggleBusinessStatus = async (businessId: number) => {
    const currentItem = cleanTrack.find(item => item.business_id === businessId);
    if (!currentItem) return;

    let newStatus: string;
    if (currentItem.status === "pending") {
      newStatus = "cleaned";
    } else if (currentItem.status === "cleaned") {
      newStatus = "pending";
    } else {
      return;
    }

    await updateBusinessStatus(businessId, newStatus);
  };

  const moveBusinessToDate = async (businessId: number) => {
    const newDate = moveToDate[businessId];
    if (!newDate) return;

    await updateBusinessStatus(businessId, "moved", newDate);

    setMoveToDate(prev => ({
      ...prev,
      [businessId]: ""
    }));
  };

  const handleDateChange = (businessId: number, date: string) => {
    setMoveToDate(prev => ({
      ...prev,
      [businessId]: date
    }));
  };

  const refreshInstance = async () => {
    if (!day || week <= 0) return;
    
    setInstanceLoading(true);
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    try {
      const instanceRes = await fetch(
        `/api/schedule/daily-instances?date=${dateStr}&week=${week}&day=${day}`
      );
      
      if (instanceRes.ok) {
        const instanceData = await instanceRes.json();
        setCurrentInstance(instanceData.instance);
        setCleanTrack(instanceData.items || []);
        
        const completedBusinessIds = new Set(
          instanceData.items
            ?.filter((item: CleanTrackItem) => item.status === "cleaned")
            ?.map((item: CleanTrackItem) => item.business_id) || []
        );

        setSchedule(prev => prev.map(entry => ({
          ...entry,
          isCompleted: completedBusinessIds.has(entry.business_id)
        })));
      }
    } catch (error) {
      console.error("❌ Error refreshing instance:", error);
    } finally {
      setInstanceLoading(false);
    }
  };

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

  const CleanTrackTab = () => {
    const completed = cleanTrack.filter(item => item.status === "cleaned").length;
    const moved = cleanTrack.filter(item => item.status === "moved").length;
    const pending = cleanTrack.filter(item => item.status === "pending").length;

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
              Clean Track - {day.charAt(0).toUpperCase() + day.slice(1)}
            </h3>
            <div className="flex items-center space-x-2">
              {currentInstance && (
                <div className="text-sm text-[hsl(var(--muted-foreground))]">
                  Instance #{currentInstance.id}
                </div>
              )}
              <button
                onClick={refreshInstance}
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
                    onClick={() => toggleBusinessStatus(item.business_id)}
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
                      onChange={(e) => handleDateChange(item.business_id, e.target.value)}
                      className="px-2 py-1 text-sm border border-[hsl(var(--border))] rounded bg-[hsl(var(--input))] text-[hsl(var(--foreground))]"
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <button
                      onClick={() => moveBusinessToDate(item.business_id)}
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
                  day: day,
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
  };

  const MembersList = () => {
    const available = membersList.filter(
      (m) => m[day as keyof Member]
    );

    const avatarColors = [
      "bg-[hsl(var(--chart-1))]",
      "bg-[hsl(var(--chart-2))]",
      "bg-[hsl(var(--chart-3))]",
      "bg-[hsl(var(--chart-4))]",
      "bg-[hsl(var(--chart-5))]",
    ];

    return (
      <div
        className={`rounded-lg p-4 ${
          isDark
            ? "bg-[hsl(var(--card))] shadow-[var(--shadow-md)]"
            : "bg-[hsl(var(--background))] shadow-[var(--shadow-sm)]"
        }`}
      >
        <h3 className="text-xl font-bold mb-4">Available Team Members</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {available.map((member, i) => (
            <div
              key={member.id}
              className={`p-4 rounded-lg ${
                isDark
                  ? "bg-[hsl(var(--secondary))]"
                  : "bg-[hsl(var(--muted))]"
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[hsl(var(--primary-foreground))] ${
                    avatarColors[i % avatarColors.length]
                  }`}
                >
                  {member.name.charAt(0)}
                </div>
                <div className="ml-3">
                  <h4 className="font-medium">{member.name}</h4>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    {days
                      .filter((d) => d !== day && member[d as keyof Member])
                      .map(
                        (d) =>
                          d.charAt(0).toUpperCase() + d.slice(1)
                      )
                      .join(", ")}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`p-4 ${
        isDark
          ? "bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
          : "bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]"
      }`}
    >
      <div className="mb-6">
        <h2
          className={`text-2xl font-bold ${
            isDark
              ? "text-[hsl(var(--foreground))]"
              : "text-[hsl(var(--foreground))]"
          }`}
        >
          Cleaning Schedule
        </h2>
        <div className="flex items-center mt-2">
          <Calendar
            size={18}
            className="mr-2 text-[hsl(var(--sidebar-primary))]"
          />
          <span
            className={`${
              isDark
                ? "text-[hsl(var(--muted-foreground))]"
                : "text-[hsl(var(--muted-foreground))]"
            }`}
          >
            Week {week} -{" "}
            {day.charAt(0).toUpperCase() + day.slice(1)}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <WeatherWidget />
        <RandomizerButton onClick={randomizeSchedule} />
      </div>

      <div className="mb-6 border-b border-[hsl(var(--border))]">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-6">
            <button
              onClick={() => setActiveTab("schedule")}
              className={`inline-block py-2 ${
                activeTab === "schedule"
                  ? "text-[hsl(var(--sidebar-primary))] border-b-2 border-[hsl(var(--sidebar-primary))]"
                  : "text-[hsl(var(--muted-foreground))]"
              }`}
            >
              Schedule
            </button>
          </li>
          <li className="mr-6">
            <button
              onClick={() => setActiveTab("team")}
              className={`inline-block py-2 ${
                activeTab === "team"
                  ? "text-[hsl(var(--sidebar-primary))] border-b-2 border-[hsl(var(--sidebar-primary))]"
                  : "text-[hsl(var(--muted-foreground))]"
              }`}
            >
              Team Members
            </button>
          </li>
          <li className="mr-6">
            <button
              onClick={() => setActiveTab("clean-track")}
              className={`inline-block py-2 flex items-center ${
                activeTab === "clean-track"
                  ? "text-[hsl(var(--sidebar-primary))] border-b-2 border-[hsl(var(--sidebar-primary))]"
                  : "text-[hsl(var(--muted-foreground))]"
              }`}
            >
              <CheckCircle2 size={16} className="mr-1" />
              Clean Track
            </button>
          </li>
        </ul>
      </div>

      {error ? (
        <div
          className={`rounded-lg p-8 mb-6 ${
            isDark
              ? "bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]"
              : "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"
          }`}
        >
          <h3 className="text-2xl font-bold mb-2">Good News!</h3>
          <p className="text-lg">{error}</p>
        </div>
      ) : (
        <>
          {activeTab === "schedule" && schedule.length > 0 && (
            <ScheduleList
              schedule={schedule.map((entry) => ({
                ...entry,
                onClick: () => {
                  setToastInfo({
                    business_id: entry.business_id,
                    business_name: entry.business_name,
                    before_open: entry.before_open,
                    address: entry.address,
                  });
                },
              }))}
            />
          )}

          {activeTab === "team" && <MembersList />}
          
          {activeTab === "clean-track" && <CleanTrackTab />}
        </>
      )}

      {toastInfo && (
        <Toast 
          business_id={toastInfo.business_id}
          business_name={toastInfo.business_name}
          address={toastInfo.address}
          before_open={toastInfo.before_open}
          onClose={() => setToastInfo(null)} 
        />
      )}
    </div>
  );
};

export default Hero;