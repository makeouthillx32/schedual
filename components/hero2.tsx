"use client";

import { useState, useEffect } from "react";
import WeekList from "@/components/WeekList"; // Import WeekList
import { fetchSchedule } from "@/components/fetchSchedule";

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
  const [week, setWeek] = useState<number>(1); // Default to Week 1
  const [schedule, setSchedule] = useState<GroupedSchedule>({}); // Grouped schedule data
  const [error, setError] = useState<string | null>(null); // Error state

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]; // Days of the week

  const loadWeeklySchedule = async () => {
    console.log("Fetching schedule for week:", week); // Debugging log
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
    }
  };

  useEffect(() => {
    loadWeeklySchedule(); // Fetch data when `week` changes
  }, [week]);

  return (
    <div className="p-5">
      {/* Week Selection */}
      <div className="flex flex-col mb-5 space-y-4">
        <div>
          <label className="block mb-2 font-bold">Select Week:</label>
          <select
            value={week}
            onChange={(e) => setWeek(Number(e.target.value))}
            className="p-2 border rounded"
          >
            <option value={1}>Week 1</option>
            <option value={2}>Week 2</option>
            <option value={3}>Week 3</option>
            <option value={4}>Week 4</option>
          </select>
        </div>
      </div>

      {/* Error or Weekly Schedule Display */}
      {error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <WeekList groupedSchedule={schedule} />
      )}
    </div>
  );
};

export default Hero2;