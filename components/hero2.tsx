"use client";

import { useState, useEffect } from "react";
import ScheduleList from "@/components/ScheduleList";
import { fetchSchedule } from "@/components/fetchSchedule";
import { Providers } from "@/app/provider"; // Import your Providers

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
  const [week, setWeek] = useState<number>(1);
  const [day, setDay] = useState<string>("Monday");
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadSchedule = async () => {
    try {
      const data = await fetchSchedule(week, day);
      setSchedule(data.schedule || []);
      setError(null); // Clear previous error
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch schedule.";
      setError(errorMessage);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, [week, day]);

  return (
    <Providers>
      <div className="p-5">
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
          <div>
            <label className="block mb-2 font-bold">Select Day:</label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
            </select>
          </div>
        </div>

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
    </Providers>
  );
};

export default Hero2;