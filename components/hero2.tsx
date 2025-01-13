"use client";

import { useState, useEffect } from "react";
import WeekList from "@/components/WeekList"; // Import WeekList
import { fetchSchedule } from "@/components/fetchSchedule";
import { Providers, useTheme } from "@/app/provider"; // Import Providers and useTheme

interface Job {
  job_name: string;
  member_name: string;
}

interface ScheduleItem {
  business_name: string;
  jobs: Job[];
  before_open: boolean;
  address: string;
}

interface GroupedSchedule {
  [day: string]: ScheduleItem[];
}

const Hero2: React.FC = () => {
  const { themeType } = useTheme(); // Access the theme from the provider
  const [week, setWeek] = useState<number>(1); // Default to Week 1
  const [schedule, setSchedule] = useState<GroupedSchedule>({}); // Grouped schedule data
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]; // Days of the week

  const loadWeeklySchedule = async () => {
    console.log("Fetching schedule for week:", week); // Debugging log
    setLoading(true); // Set loading state
    try {
      const groupedSchedules: GroupedSchedule = {};

      // Fetch schedules for all days of the week
      for (const day of days) {
        const data = await fetchSchedule(week, day.toLowerCase()); // Fetch schedule for each day
        console.log(`API Response for ${day}:`, data); // Debug API response
        groupedSchedules[day] = data.schedule || []; // Group schedules by day
      }

      setSchedule(groupedSchedules); // Set grouped schedule data
      setError(null); // Clear error
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch schedule.";
      console.error("Error fetching schedule:", errorMessage); // Log errors
      setError(errorMessage); // Set error state
    } finally {
      setLoading(false); // Clear loading state
    }
  };

  useEffect(() => {
    loadWeeklySchedule(); // Fetch data when `week` changes
  }, [week]);

  return (
    <Providers>
      <div
        className={`p-5 ${
          themeType === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"
        }`}
      >
        {/* Week Selection */}
        <div className="flex flex-col mb-5 space-y-4">
          <div>
            <label className="block mb-2 font-bold">Select Week:</label>
            <select
              value={week}
              onChange={(e) => setWeek(Number(e.target.value))}
              className={`p-2 border rounded ${
                themeType === "dark" ? "bg-gray-800 text-white" : "bg-gray-100 text-black"
              }`}
            >
              <option value={1}>Week 1</option>
              <option value={2}>Week 2</option>
              <option value={3}>Week 3</option>
              <option value={4}>Week 4</option>
            </select>
          </div>
        </div>

        {/* Conditional Rendering */}
        {loading ? (
          <div className="text-center">Loading schedule...</div>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : (
          <WeekList groupedSchedule={schedule} />
        )}
      </div>
    </Providers>
  );
};

export default Hero2;