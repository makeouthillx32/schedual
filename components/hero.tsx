"use client";

import { useState, useEffect } from "react";
import { fetchSchedule } from "@/components/fetchSchedule";
import { assignRandomJobs } from "@/components/assignRandomJobs";
import Toast from "@/components/Toast";
import RandomizerButton from "@/components/RandomizerButton";
import WeatherWidget from "@/components/WeatherWidget";
import ScheduleList from "@/components/ScheduleList";
import TeamMembersList from "@/components/TeamMembersList";
import CleanTrack from "@/components/CleanTrack";
import { useTheme } from "@/app/provider";
import { Calendar, CheckCircle2 } from "lucide-react";

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

  const handleToggleBusinessStatus = async (businessId: number) => {
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

  const handleMoveBusinessToDate = async (businessId: number) => {
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

  const handleRefreshInstance = async () => {
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

  return (
    <div
      className={`p-4 ${
        isDark
          ? "bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
          : "bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]"
      }`}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">
          Cleaning Schedule
        </h2>
        <div className="flex items-center mt-2">
          <Calendar
            size={18}
            className="mr-2 text-[hsl(var(--sidebar-primary))]"
          />
          <span className="text-[hsl(var(--muted-foreground))]">
            Week {week} - {day.charAt(0).toUpperCase() + day.slice(1)}
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

          {activeTab === "team" && (
            <TeamMembersList 
              members={membersList} 
              currentDay={day} 
            />
          )}
          
          {activeTab === "clean-track" && (
            <CleanTrack
              cleanTrack={cleanTrack}
              currentInstance={currentInstance}
              currentDay={day}
              week={week}
              instanceLoading={instanceLoading}
              moveToDate={moveToDate}
              onToggleBusinessStatus={handleToggleBusinessStatus}
              onMoveBusinessToDate={handleMoveBusinessToDate}
              onDateChange={handleDateChange}
              onRefreshInstance={handleRefreshInstance}
            />
          )}
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