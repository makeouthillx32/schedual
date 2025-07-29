// components/hero.tsx - Fixed version with proper error handling
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
  const [loading, setLoading] = useState(true);
  const [toastInfo, setToastInfo] = useState<{
    business_id?: number;
    business_name: string;
    before_open: boolean;
    address: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<"schedule" | "team" | "clean-track">("schedule");
  
  const [currentInstance, setCurrentInstance] = useState<DailyInstance | null>(null);
  const [cleanTrack, setCleanTrack] = useState<CleanTrackItem[]>([]);
  const [instanceLoading, setInstanceLoading] = useState(false);

  // ✅ FIXED: Added proper error handling for members API
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch("/api/schedule/members");
        if (!res.ok) {
          console.warn("Failed to load members, using empty list");
          setMembersList([]);
          return;
        }
        const members = await res.json();
        
        // ✅ FIXED: Validate members data structure
        if (Array.isArray(members)) {
          const validMembers = members.filter(member => 
            member && 
            typeof member === 'object' && 
            member.name && 
            typeof member.name === 'string'
          );
          console.log(`✅ Loaded ${validMembers.length} valid members`);
          setMembersList(validMembers);
        } else {
          console.warn("Invalid members data format, using empty list");
          setMembersList([]);
        }
      } catch (error) {
        console.error("Error fetching members:", error);
        setMembersList([]);
      }
    };

    fetchMembers();
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
      setLoading(true);
      setInstanceLoading(true);
      try {
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];

        // ✅ FIXED: Added proper error handling for daily instances
        let instanceData = { instance: null, items: [] };
        try {
          const instanceRes = await fetch(
            `/api/schedule/daily-instances?date=${dateStr}&week=${week}&day=${day}`
          );
          
          if (instanceRes.ok) {
            instanceData = await instanceRes.json();
            setCurrentInstance(instanceData.instance);
          } else {
            console.warn("Failed to load daily instance, continuing without it");
          }
        } catch (instanceError) {
          console.error("Error loading daily instance:", instanceError);
        }
        
        // ✅ FIXED: Added proper error handling for moved businesses
        let movedToToday = [];
        try {
          movedToToday = await checkForMovedBusinesses(dateStr);
        } catch (movedError) {
          console.error("Error checking moved businesses:", movedError);
        }
        
        const allItems = [...(instanceData.items || []), ...movedToToday];
        setCleanTrack(allItems);

        // ✅ FIXED: Added proper error handling for schedule data
        let scheduleData = { schedule: [] };
        try {
          scheduleData = await fetchSchedule(week, day);
        } catch (scheduleError) {
          console.error("Error fetching schedule:", scheduleError);
          setError("Failed to load schedule data");
          setSchedule([]);
          return;
        }
        
        if (!scheduleData.schedule?.length) {
          setError("No businesses to clean today. Have a good day off!");
          setSchedule([]);
          return;
        }

        // ✅ FIXED: Added safety checks for members filtering
        const available = membersList.filter(member => {
          if (!member || !member.name) {
            console.warn("Skipping invalid member:", member);
            return false;
          }
          return member[day as keyof Member] === true;
        });

        console.log(`✅ Found ${available.length} available members for ${day}`);

        const completedBusinessIds = new Set(
          allItems
            ?.filter((item: CleanTrackItem) => item.status === "cleaned")
            ?.map((item: CleanTrackItem) => item.business_id) || []
        );

        const updated = scheduleData.schedule.map((entry: any) => {
          const isCompleted = completedBusinessIds.has(entry.business_id);
          
          return {
            ...entry,
            isCompleted,
            // ✅ FIXED: Only assign jobs if we have available members
            jobs: available.length > 0 
              ? assignRandomJobs(
                  ["Sweep and Mop", "Vacuum", "Bathrooms and Trash"],
                  available
                )
              : [{ job_name: "No members available", member_name: "Please add team members" }],
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
        setLoading(false);
        setInstanceLoading(false);
      }
    };

    loadDailyData();
  }, [week, day, membersList]);

  const randomizeSchedule = () => {
    const available = membersList.filter(member => {
      if (!member || !member.name) return false;
      return member[day as keyof Member] === true;
    });

    if (available.length === 0) {
      console.warn("No available members to randomize");
      return;
    }

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

  const checkForMovedBusinesses = async (dateStr: string) => {
    try {
      const res = await fetch(`/api/schedule/daily-instances/moved?date=${dateStr}`);
      if (res.ok) {
        const data = await res.json();
        return data.movedBusinesses || [];
      }
      return [];
    } catch (error) {
      console.error("Error checking for moved businesses:", error);
      return [];
    }
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

  const handleMoveBusinessToDate = async (businessId: number, date: string) => {
    if (!date) return;
    await updateBusinessStatus(businessId, "moved", date);
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

  // ✅ ADDED: Loading state display
  if (loading) {
    return (
      <div className={`p-4 ${isDark ? "bg-[hsl(var(--background))]" : "bg-[hsl(var(--muted))]"}`}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--sidebar-primary))] mx-auto mb-4"></div>
            <p className="text-[hsl(var(--muted-foreground))]">Loading cleaning schedule...</p>
          </div>
        </div>
      </div>
    );
  }

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
              Team Members ({membersList.length})
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
          <h3 className="text-2xl font-bold mb-2">
            {error.includes("Failed") ? "System Message" : "Good News!"}
          </h3>
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
              onToggleBusinessStatus={handleToggleBusinessStatus}
              onMoveBusinessToDate={handleMoveBusinessToDate}
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