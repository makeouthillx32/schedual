"use client";

import { useState, useEffect } from "react";
import ScheduleList from "@/components/ScheduleList";
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

const Hero2: React.FC = () => {
  const [week, setWeek] = useState<number>(1); // Default to Week 1
  const [day, setDay] = useState<string>("monday"); // Default to Monday in lowercase
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]); // Schedule data
  const [error, setError] = useState<string | null>(null); // Error state

  const loadSchedule = async () => {
    console.log("Fetching schedule with:", { week, day }); // Log parameters for debugging
    try {
      const data = await fetchSchedule(week, day); // Fetch schedule data
      console.log("API Response:", data); // Log API response
      setSchedule(data.schedule || []); // Update state with the schedule
      setError(null); // Clear error
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch schedule.";
      console.error("Error fetching schedule:", errorMessage); // Log error
      setError(errorMessage); // Update error state
    }
  };

  useEffect(() => {
    loadSchedule(); // Fetch data when `week` or `day` changes
  }, [week, day]);

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

        {/* Day Selection */}
        <div>
          <label className="block mb-2 font-bold">Select Day:</label>
          <select
            value={day}
            onChange={(e) => setDay(e.target.value.toLowerCase())} // Ensure lowercase for API
            className="p-2 border rounded"
          >
            <option value="monday">Monday</option>
            <option value="tuesday">Tuesday</option>
            <option value="wednesday">Wednesday</option>
            <option value="thursday">Thursday</option>
            <option value="friday">Friday</option>
          </select>
        </div>
      </div>

      {/* Error Message or Schedule List */}
      {error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <ScheduleList
          schedule={schedule.map((item) => ({
            ...item,
            onClick: () => console.log(`Clicked on ${item.business_name}`),
          }))}
        />
      )}
    </div>
  );
};

export default Hero2;