"use client";

import { useState, useEffect } from "react";
import { fetchSchedule } from "@/components/fetchSchedule";
import { assignRandomJobs } from "@/components/assignRandomJobs";
import Toast from "@/components/Toast";
import RandomizerButton from "@/components/RandomizerButton";
import WeatherWidget from "@/components/WeatherWidget";
import ScheduleList from "@/components/ScheduleList";
import { useTheme } from "@/app/provider";
import { Calendar, CheckCircle2, Circle, ArrowRight, Clock } from "lucide-react";

interface JobSchedule {
  business_name: string;
  jobs: { job_name: string; member_name: string }[];
  before_open: boolean;
  address: string;
  business_id?: number;
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
  business_id: number;
  business_name: string;
  address: string;
  before_open: boolean;
  status: "pending" | "cleaned" | "missed";
  cleaned_at?: string;
  moved_to_date?: string;
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
  
  // Clean Track state
  const [cleanTrack, setCleanTrack] = useState<CleanTrackItem[]>([]);
  const [moveToDate, setMoveToDate] = useState<{ [key: number]: string }>({});

  // 1) fetch live members
  useEffect(() => {
    fetch("/api/schedule/members")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load members");
        return res.json() as Promise<Member[]>;
      })
      .then(setMembersList)
      .catch(console.error);
  }, []);

  // 2) set current day/week
  useEffect(() => {
    const today = new Date();
    setDay(
      today
        .toLocaleString("en-US", { weekday: "long" })
        .toLowerCase()
    );
    setWeek(Math.ceil(today.getDate() / 7));
  }, []);

  // 3) load schedule when day/week change
  useEffect(() => {
    if (!day || week <= 0) return;

    const loadSchedule = async () => {
      try {
        console.log("🔍 Loading schedule for week:", week, "day:", day);
        const data = await fetchSchedule(week, day);
        
        if (!data.schedule?.length) {
          setError("No businesses to clean today. Have a good day off!");
          setSchedule([]);
          setCleanTrack([]);
          return;
        }

        console.log("📊 Schedule data received:", data.schedule);

        // use live members here
        const available = membersList.filter(
          (m) => m[day as keyof Member]
        );

        const updated = data.schedule.map((entry: any) => {
          console.log("🏢 Processing business entry:", entry);
          
          return {
            ...entry,
            jobs: assignRandomJobs(
              ["Sweep and Mop", "Vacuum", "Bathrooms and Trash"],
              available
            ),
            onClick: () => {
              console.log("🖱️ Business clicked:", entry);
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

        // Initialize Clean Track with current schedule
        const trackItems: CleanTrackItem[] = data.schedule.map((entry: any) => ({
          business_id: entry.business_id || Math.random(),
          business_name: entry.business_name,
          address: entry.address,
          before_open: entry.before_open,
          status: "pending"
        }));
        setCleanTrack(trackItems);
        setError(null);
      } catch (err) {
        console.error("❌ Error loading schedule:", err);
        setError("No businesses to clean today. Have a good day off!");
        setSchedule([]);
        setCleanTrack([]);
      }
    };

    loadSchedule();
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

  // Clean Track functions
  const toggleBusinessStatus = (businessId: number) => {
    setCleanTrack(prev => prev.map(item => {
      if (item.business_id === businessId) {
        if (item.status === "pending") {
          return {
            ...item,
            status: "cleaned",
            cleaned_at: new Date().toISOString()
          };
        } else if (item.status === "cleaned") {
          return {
            ...item,
            status: "pending",
            cleaned_at: undefined
          };
        }
      }
      return item;
    }));
  };

  const moveBusinessToDate = (businessId: number) => {
    const newDate = moveToDate[businessId];
    if (!newDate) return;

    setCleanTrack(prev => prev.map(item => {
      if (item.business_id === businessId) {
        return {
          ...item,
          status: "missed",
          moved_to_date: newDate
        };
      }
      return item;
    }));

    // Clear the date input
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "cleaned":
        return <CheckCircle2 size={20} className="text-green-600" />;
      case "missed":
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
      case "missed":
        return (
          <span className="text-yellow-600 font-medium">
            → Moved to {item.moved_to_date && new Date(item.moved_to_date).toLocaleDateString()}
          </span>
        );
      default:
        return <span className="text-gray-500">Pending</span>;
    }
  };

  const CleanTrackTab = () => {
    const completed = cleanTrack.filter(item => item.status === "cleaned").length;
    const missed = cleanTrack.filter(item => item.status === "missed").length;
    const pending = cleanTrack.filter(item => item.status === "pending").length;

    return (
      <div
        className={`rounded-lg p-4 ${
          isDark
            ? "bg-[hsl(var(--card))] shadow-[var(--shadow-md)]"
            : "bg-[hsl(var(--background))] shadow-[var(--shadow-sm)]"
        }`}
      >
        {/* Summary Stats */}
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <CheckCircle2 size={24} className="mr-2 text-[hsl(var(--sidebar-primary))]" />
            Clean Track - {day.charAt(0).toUpperCase() + day.slice(1)}
          </h3>
          
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
              <div className="text-2xl font-bold text-gray-500">{pending}</div>
              <div className="text-sm text-[hsl(var(--muted-foreground))]">Pending</div>
            </div>
            <div className={`p-3 rounded-lg text-center ${
              isDark ? "bg-[hsl(var(--secondary))]" : "bg-[hsl(var(--muted))]"
            }`}>
              <div className="text-2xl font-bold text-yellow-600">{missed}</div>
              <div className="text-sm text-[hsl(var(--muted-foreground))]">Moved</div>
            </div>
          </div>
        </div>

        {/* Business List */}
        <div className="space-y-3">
          {cleanTrack.map((item) => (
            <div
              key={item.business_id}
              className={`p-4 rounded-lg border transition-all ${
                isDark
                  ? "bg-[hsl(var(--card))] border-[hsl(var(--border))]"
                  : "bg-white border-[hsl(var(--border))]"
              } ${
                item.status === "cleaned" 
                  ? "border-green-200 bg-green-50" 
                  : item.status === "missed"
                  ? "border-yellow-200 bg-yellow-50"
                  : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {/* Status Checkbox */}
                  <button
                    onClick={() => toggleBusinessStatus(item.business_id)}
                    className="mt-1 hover:scale-110 transition-transform"
                    disabled={item.status === "missed"}
                  >
                    {getStatusIcon(item.status)}
                  </button>

                  {/* Business Info */}
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
                          ? "bg-red-100 text-red-800" 
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {item.before_open ? "Before Open" : "After Close"}
                      </span>
                      {getStatusText(item)}
                    </div>
                  </div>
                </div>

                {/* Move to Date Section */}
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
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
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

        {/* Export/Summary Section */}
        <div className="mt-6 p-4 border-t border-[hsl(var(--border))]">
          <div className="flex items-center justify-between">
            <div className="text-sm text-[hsl(var(--muted-foreground))]">
              Progress: {completed} of {cleanTrack.length} completed
              {missed > 0 && ` • ${missed} moved to future dates`}
            </div>
            <button
              className="px-4 py-2 bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] rounded hover:bg-[hsl(var(--sidebar-primary))]/90 transition-colors"
              onClick={() => {
                console.log("📊 Clean Track Report:", {
                  date: new Date().toISOString().split('T')[0],
                  day: day,
                  week: week,
                  summary: { completed, pending, missed },
                  details: cleanTrack
                });
                alert(`Daily Report Generated!\n\nCompleted: ${completed}\nPending: ${pending}\nMoved: ${missed}\n\nCheck console for full details.`);
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
      {/* Page Title */}
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

      {/* Weather & Randomizer */}
      <div className="mb-6">
        <WeatherWidget />
        <RandomizerButton onClick={randomizeSchedule} />
      </div>

      {/* Tabs */}
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

      {/* Content */}
      {error ? (
        <div
          className={`rounded-lg p-8 mb-6 ${
            isDark
              ? "bg-[hsl(var(--destructive))/0.2] text-[hsl(var(--destructive-foreground))]"
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
                  console.log("📋 ScheduleList business clicked:", entry);
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