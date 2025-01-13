"use client";

import { useState, useEffect } from "react";
import { fetchSchedule } from "@/components/fetchSchedule";
import ScheduleList from "@/components/ScheduleList";
import WeatherWidget from "@/components/WeatherWidget";

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
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch schedule.";
      setError(errorMessage);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, [week, day]);

  return (
    <div className="p-5">
      <div className="flex flex-col gap-3 mb-5">
        <label>
          Select Week:
          <select
            value={week}
            onChange={(e) => setWeek(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            {[1, 2, 3, 4].map((week) => (
              <option key={week} value={week}>
                Week {week}
              </option>
            ))}
          </select>
        </label>
        <label>
          Select Day:
          <select
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="border rounded px-2 py-1"
          >
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(
              (day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              )
            )}
          </select>
        </label>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <WeatherWidget />
      <ScheduleList schedule={schedule} />
    </div>
  );
};

export default Hero2;