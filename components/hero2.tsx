"use client";

import { useState, useEffect } from "react";
import ScheduleList from "@/components/ScheduleList";
import { useTheme } from "@/app/provider";

interface JobSchedule {
  business_name: string;
  jobs: { job_name: string; member_name: string }[];
  before_open: boolean;
  address: string;
}

const Hero2 = () => {
  const [week, setWeek] = useState<number>(1); // Default week to 1
  const [day, setDay] = useState<string>("monday"); // Default day to Monday
  const [schedule, setSchedule] = useState<JobSchedule[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { themeType } = useTheme();

  const fetchSchedule = async () => {
    try {
      const response = await fetch(`/api/schedule?week=${week}&day=${day}`);
      if (!response.ok) {
        throw new Error("Failed to fetch schedule");
      }

      const data = await response.json();
      setSchedule(data.schedule || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [week, day]);

  return (
    <div
      className={`p-5 ${
        themeType === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"
      }`}
    >
      <div className="mb-5">
        <label className="block mb-2 text-sm font-bold">Select Week</label>
        <select
          value={week}
          onChange={(e) => setWeek(Number(e.target.value))}
          className="p-2 border rounded-md"
        >
          {[1, 2, 3, 4].map((w) => (
            <option key={w} value={w}>
              Week {w}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-5">
        <label className="block mb-2 text-sm font-bold">Select Day</label>
        <select
          value={day}
          onChange={(e) => setDay(e.target.value)}
          className="p-2 border rounded-md"
        >
          {["monday", "tuesday", "wednesday", "thursday", "friday"].map((d) => (
            <option key={d} value={d}>
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-red-500">Error: {error}</p>}

      <ScheduleList
        schedule={schedule.map((entry) => ({
          ...entry,
          onClick: () => console.log("Clicked:", entry),
        }))}
      />
    </div>
  );
};

export default Hero2;