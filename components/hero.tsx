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

    return (
      <div className={`rounded-lg ${
        isDark ? "bg-[#141f38] shadow-card" : "bg-white shadow-1"
      } p-4`}>
        <h3 className="text-xl font-bold mb-4">Available Team Members</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableMembers.map((member, index) => (
            <div key={index} className={`p-4 rounded-lg ${
              isDark ? "bg-[#1a2639]" : "bg-gray-50"
            }`}>
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                  ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-pink-500", "bg-yellow-500"][index % 5]
                }`}>
                  {member.name.charAt(0)}
                </div>
                <div className="ml-3">
                  <h4 className="font-medium">{member.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
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
      isDark ? "bg-[#0f172a] text-white" : "bg-gray-50 text-dark"
    }`}>
      {/* Page Title */}
      <div className="mb-6">
        <h2 className={`text-2xl font-bold ${
          isDark ? "text-white" : "text-gray-900"
        }`}>
          Cleaning Schedule
        </h2>
        <div className="flex items-center mt-2">
          <Calendar size={18} className="mr-2 text-blue-500" />
          <span className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
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
      <div className="mb-6 border-b border-gray-600">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-6">
            <button
              onClick={() => setActiveTab("schedule")}
              className={`inline-block py-2 ${
                activeTab === "schedule"
                  ? isDark 
                    ? "text-blue-400 border-b-2 border-blue-400" 
                    : "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 dark:text-gray-400"
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
                    ? "text-blue-400 border-b-2 border-blue-400" 
                    : "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 dark:text-gray-400"
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
          isDark ? "bg-green-900/20 text-green-200" : "bg-green-50 text-green-700"
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