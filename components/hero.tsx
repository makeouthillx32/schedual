"use client";

import { useState, useEffect } from "react";
import { fetchSchedule } from "@/components/fetchSchedule";
import { assignRandomJobs } from "@/components/assignRandomJobs";
import Toast from "@/components/Toast";
import RandomizerButton from "@/components/RandomizerButton";
import WeatherWidget from "@/components/WeatherWidget";
import { members } from "../lib/members";
import { useTheme } from "@/app/provider";
import { Calendar, Clock, MapPin } from "lucide-react";

interface JobSchedule {
  business_name: string;
  jobs: { job_name: string; member_name: string }[];
  before_open: boolean;
  address: string;
}

const CMSSchedulePage = () => {
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

  const JobCard = ({ job, memberName, index }: { job: string; memberName: string; index: number }) => {
    const colors = ["bg-blue-100 border-blue-300", "bg-green-100 border-green-300", "bg-purple-100 border-purple-300"];
    const darkColors = ["bg-blue-900/30 border-blue-700", "bg-green-900/30 border-green-700", "bg-purple-900/30 border-purple-700"];
    
    const colorClass = isDark ? darkColors[index % darkColors.length] : colors[index % colors.length];
    
    return (
      <div className={`p-4 rounded-lg border ${colorClass} mb-3 transition-all hover:shadow-md`}>
        <div className="flex justify-between items-center">
          <h4 className="font-semibold">{job}</h4>
          <span className={`px-3 py-1 rounded-full text-sm ${
            isDark ? "bg-gray-800 text-white" : "bg-white text-gray-800"
          } shadow-sm`}>
            {memberName}
          </span>
        </div>
      </div>
    );
  };

  const BusinessCard = ({ business }: { business: JobSchedule }) => {
    return (
      <div className={`rounded-[10px] ${
        isDark ? "bg-gray-dark shadow-card" : "bg-white shadow-1"
      } p-6 mb-6 transition-all hover:translate-y-[-2px]`}>
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-xl font-bold">{business.business_name}</h3>
          <span className={`px-3 py-1 rounded-full text-sm ${
            business.before_open 
              ? isDark ? "bg-amber-900/50 text-amber-200" : "bg-amber-100 text-amber-800" 
              : isDark ? "bg-green-900/50 text-green-200" : "bg-green-100 text-green-800"
          }`}>
            {business.before_open ? "Before Opening" : "After Hours"}
          </span>
        </div>
        
        <div className="mb-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
          <MapPin size={16} className="mr-2" />
          <span>{business.address}</span>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
          <h4 className="font-medium mb-3">Assigned Tasks</h4>
          {business.jobs.map((job, index) => (
            <JobCard 
              key={index} 
              job={job.job_name} 
              memberName={job.member_name} 
              index={index} 
            />
          ))}
        </div>
      </div>
    );
  };

  const MembersList = () => {
    const availableMembers = members.filter(
      (member) => member[day as keyof typeof member]
    );

    return (
      <div className={`rounded-[10px] ${
        isDark ? "bg-gray-dark shadow-card" : "bg-white shadow-1"
      } p-6`}>
        <h3 className="text-xl font-bold mb-4">Available Team Members</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableMembers.map((member, index) => (
            <div key={index} className={`p-4 rounded-lg border ${
              isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
            }`}>
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
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
    <div className={`min-h-screen ${
      isDark ? "bg-[#020d1a] text-white" : "bg-gray-2 text-dark"
    }`}>
      <div className="max-w-screen-2xl mx-auto p-4 md:p-6 2xl:p-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold ${
              isDark ? "text-white" : "text-dark"
            }`}>
              Cleaning Schedule
            </h1>
            <div className="flex items-center mt-2">
              <Calendar size={18} className="mr-2 text-primary" />
              <span className="text-gray-500 dark:text-gray-400">
                Week {week} - {day.charAt(0).toUpperCase() + day.slice(1)}
              </span>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center">
            <WeatherWidget />
            <div className="ml-4">
              <RandomizerButton onClick={randomizeSchedule} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <ul className="flex flex-wrap -mb-px">
            <li className="mr-2">
              <button
                onClick={() => setActiveTab("schedule")}
                className={`inline-block py-4 px-4 text-sm font-medium ${
                  activeTab === "schedule"
                    ? isDark 
                      ? "text-primary border-b-2 border-primary" 
                      : "text-primary border-b-2 border-primary"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Schedule
              </button>
            </li>
            <li className="mr-2">
              <button
                onClick={() => setActiveTab("team")}
                className={`inline-block py-4 px-4 text-sm font-medium ${
                  activeTab === "team"
                    ? isDark 
                      ? "text-primary border-b-2 border-primary" 
                      : "text-primary border-b-2 border-primary"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Team Members
              </button>
            </li>
          </ul>
        </div>

        {/* Content */}
        {error ? (
          <div className={`rounded-[10px] ${
            isDark ? "bg-green-900/20 text-green-200" : "bg-green-50 text-green-700"
          } p-8 text-center mb-6`}>
            <h3 className="text-2xl font-bold mb-2">Good News!</h3>
            <p className="text-lg">{error}</p>
          </div>
        ) : (
          <>
            {activeTab === "schedule" && (
              <div className="grid grid-cols-1 gap-6">
                {schedule.map((business, index) => (
                  <BusinessCard 
                    key={index} 
                    business={business} 
                  />
                ))}
              </div>
            )}
            
            {activeTab === "team" && <MembersList />}
          </>
        )}
        
        {toastInfo && (
          <Toast {...toastInfo} onClose={() => setToastInfo(null)} />
        )}
      </div>
    </div>
  );
};

export default CMSSchedulePage;