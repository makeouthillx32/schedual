"use client";

import { useState, useEffect } from "react";
import { fetchSchedule } from "@/components/fetchSchedule";
import { assignRandomJobs } from "@/components/assignRandomJobs";
import Toast from "@/components/Toast";
import RandomizerButton from "@/components/RandomizerButton";
import WeatherWidget from "@/components/WeatherWidget";
import ScheduleList from "@/components/ScheduleList";
import { useTheme } from "@/app/provider";
import { Calendar } from "lucide-react";

interface JobSchedule {
  business_name: string;
  jobs: { job_name: string; member_name: string }[];
  before_open: boolean;
  address: string;
  business_id?: number; // Add business_id to the interface
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
  const [activeTab, setActiveTab] = useState<"schedule" | "team">("schedule");

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
                business_id: entry.business_id, // Include business_id here
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
        console.error("❌ Error loading schedule:", err);
        setError("No businesses to clean today. Have a good day off!");
        setSchedule([]);
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
                    business_id: entry.business_id, // Include business_id here too
                    business_name: entry.business_name,
                    before_open: entry.before_open,
                    address: entry.address,
                  });
                },
              }))}
            />
          )}

          {activeTab === "team" && <MembersList />}
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