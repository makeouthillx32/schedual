"use client";

import { useState, useEffect } from "react";
import { fetchSchedule } from "@/components/fetchSchedule";
import { assignRandomJobs } from "@/components/assignRandomJobs";
import Toast from "@/components/Toast";
import ScheduleList from "@/components/ScheduleList";
import RandomizerButton from "@/components/RandomizerButton";
import WeatherWidget from "@/components/WeatherWidget";
import { members } from "@/lib/members";

const Hero2: React.FC = () => {
  const [week, setWeek] = useState(1);
  const [day, setDay] = useState("Monday");
  const [schedule, setSchedule] = useState([]);
  const [error, setError] = useState<string | null>(null);

  const loadSchedule = async () => {
    try {
      const data = await fetchSchedule(week, day);
      setSchedule(data.schedule);
    } catch (err) {
      setError(err.message || "Failed to fetch schedule.");
    }
  };

  useEffect(() => {
    loadSchedule();
  }, [week, day]);

  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-5">
        <div>
          <label>
            Select Week:
            <select
              value={week}
              onChange={(e) => setWeek(Number(e.target.value))}
            >
              <option value={1}>Week 1</option>
              <option value={2}>Week 2</option>
              <option value={3}>Week 3</option>
              <option value={4}>Week 4</option>
            </select>
          </label>
          <label>
            Select Day:
            <select value={day} onChange={(e) => setDay(e.target.value)}>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
            </select>
          </label>
        </div>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <WeatherWidget />
      <ScheduleList schedule={schedule} />
    </div>
  );
};

export default Hero2;