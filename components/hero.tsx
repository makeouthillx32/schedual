"use client";

import { useState, useEffect } from "react";
import { fetchSchedule } from "@/components/fetchSchedule";
import { assignRandomJobs } from "@/components/assignRandomJobs";
import Toast from "@/components/Toast";
import RandomizerButton from "@/components/RandomizerButton";
import WeatherWidget from "@/components/WeatherWidget";
import ScheduleList from "@/components/ScheduleList";
import { members } from "../lib/members";
import { useTheme } from "@/app/provider";
import { Calendar } from "lucide-react";

interface JobSchedule {
  business_name: string;
  jobs: { job_name: string; member_name: string }[];
  before_open: boolean;
  address: string;
}

const Hero = () => {
  const [week, setWeek] = useState<number>(0);
  const [day, setDay] = useState<string>("");
  const [schedule, setSchedule] = useState<JobSchedule[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [toastInfo, setToastInfo] = useState<{
    business_name: string;
    before_open: boolean;
    address: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<string>("schedule");

  const { themeType } = useTheme();
  const isDark = themeType === "dark";

  const randomizeSchedule = () => {
    const availableMembers = members.filter(
      (member) => member[day as keyof typeof member]
    );

    const randomizedSchedule = schedule.map((entry) => ({
      ...entry,
      jobs: assignRandomJobs(
        ["Sweep and Mop", "Vacuum", "Bathrooms and Trash"],
        availableMembers
      ),
    }));

    setSchedule(randomizedSchedule);
  };

  useEffect(() => {
    const today = new Date();
    const currentDay = today
      .toLocaleString("en-US", { weekday: "long" })
      .toLowerCase();
    const currentWeek = Math.ceil(today.getDate() / 7);

    setDay(currentDay);
    setWeek(currentWeek);
  }, []);

  const loadSchedule = async () => {
    try {
      const data = await fetchSchedule(week, day);

      if (!data.schedule || data.schedule.length === 0) {
        setError("No businesses to clean today. Have a good day off!");
        setSchedule([]);
        return;
      }

      const availableMembers = members.filter(
        (member) => member[day as keyof typeof member]
      );

      const updatedSchedule = data.schedule.map((entry: any) => ({
        ...entry,
        jobs: assignRandomJobs(
          ["Sweep and Mop", "Vacuum", "Bathrooms and Trash"],
          availableMembers
        ),
        onClick: () => setToastInfo(entry),
      }));

      setSchedule(updatedSchedule);
      setError(null);
    } catch (err: unknown) {
      setError("No businesses to clean today. Have a good day off!");
      setSchedule([]);
    }
  };

  useEffect(() => {
    if (week > 0 && day) loadSchedule();
  }, [week, day]);

  const MembersList = () => {
    const availableMembers = members.filter(
      (member) => member[day as keyof typeof member]
    );

    // Color classes for member avatars using CSS variables
    const avatarColors = [
      "bg-[hsl(var(--chart-1))]",
      "bg-[hsl(var(--chart-2))]", 
      "bg-[hsl(var(--chart-3))]",
      "bg-[hsl(var(--chart-4))]",
      "bg-[hsl(var(--chart-5))]"
    ];

    return (
      <div className={`rounded-lg ${
        isDark ? "bg-[hsl(var(--card))] shadow-[var(--shadow-md)]" : "bg-[hsl(var(--background))] shadow-[var(--shadow-sm)]"
      } p-4`}>
        <h3 className="text-xl font-bold mb-4">Available Team Members</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableMembers.map((member, index) => (
            <div key={index} className={`p-4 rounded-lg ${
              isDark ? "bg-[hsl(var(--secondary))]" : "bg-[hsl(var(--muted))]"
            }`}>
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[hsl(var(--primary-foreground))] ${
                  avatarColors[index % avatarColors.length]
                }`}>
                  {member.name.charAt(0)}
                </div>
                <div className="ml-3">
                  <h4 className="font-medium">{member.name}</h4>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    {Object.entries(member)
                      .filter(([key, value]) => value === true && key !== day)
                      .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1))
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
    <div className={`p-4 ${
      isDark ? "bg-[hsl(var(--background))] text-[hsl(var(--foreground))]" : "bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]"
    }`}>
      {/* Page Title */}
      <div className="mb-6">
        <h2 className={`text-2xl font-bold ${
          isDark ? "text-[hsl(var(--foreground))]" : "text-[hsl(var(--foreground))]"
        }`}>
          Cleaning Schedule
        </h2>
        <div className="flex items-center mt-2">
          <Calendar size={18} className="mr-2 text-[hsl(var(--sidebar-primary))]" />
          <span className={`${isDark ? "text-[hsl(var(--muted-foreground))]" : "text-[hsl(var(--muted-foreground))]"}`}>
            Week {week} - {day.charAt(0).toUpperCase() + day.slice(1)}
          </span>
        </div>
      </div>

      {/* Weather & Randomizer */}
      <div className="mb-6">
        <div className="mb-4">
          <WeatherWidget />
        </div>
        <div>
          <RandomizerButton onClick={randomizeSchedule} />
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-[hsl(var(--border))]">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-6">
            <button
              onClick={() => setActiveTab("schedule")}
              className={`inline-block py-2 ${
                activeTab === "schedule"
                  ? isDark 
                    ? "text-[hsl(var(--sidebar-primary))] border-b-2 border-[hsl(var(--sidebar-primary))]" 
                    : "text-[hsl(var(--sidebar-primary))] border-b-2 border-[hsl(var(--sidebar-primary))]"
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
                  ? isDark 
                    ? "text-[hsl(var(--sidebar-primary))] border-b-2 border-[hsl(var(--sidebar-primary))]" 
                    : "text-[hsl(var(--sidebar-primary))] border-b-2 border-[hsl(var(--sidebar-primary))]"
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
        <div className={`rounded-lg ${
          isDark ? "bg-[hsl(var(--destructive))/0.2] text-[hsl(var(--destructive-foreground))]" : "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"
        } p-8 text-center mb-6`}>
          <h3 className="text-2xl font-bold mb-2">Good News!</h3>
          <p className="text-lg">{error}</p>
        </div>
      ) : (
        <>
          {activeTab === "schedule" && (
            <div>
              {schedule.length > 0 && (
                <ScheduleList
                  schedule={schedule.map((entry) => ({
                    ...entry,
                    onClick: () => setToastInfo({
                      business_name: entry.business_name,
                      before_open: entry.before_open,
                      address: entry.address,
                    }),
                  }))}
                />
              )}
            </div>
          )}
          
          {activeTab === "team" && <MembersList />}
        </>
      )}
      
      {toastInfo && (
        <Toast {...toastInfo} onClose={() => setToastInfo(null)} />
      )}
    </div>
  );
};

export default Hero;