"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/app/provider"; // Ensure theme context is available
import { fetchSchedule } from "@/components/fetchSchedule";

const Hero2: React.FC = () => {
  const { themeType } = useTheme(); // Use theme for styling if needed
  const [week, setWeek] = useState(1);
  const [day, setDay] = useState("Monday");
  const [schedule, setSchedule] = useState([]);
  const [error, setError] = useState<string | null>(null);

  const loadSchedule = async () => {
    try {
      const data = await fetchSchedule(week, day); // Fetch schedule data
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
    <div
      className={`p-5 ${
        themeType === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"
      }`}
    >
      <div className="flex flex-col gap-4 mb-5">
        <div>
          <label className="block">
            Select Week:
            <select
              value={week}
              onChange={(e) => setWeek(Number(e.target.value))}
              className="ml-2 p-1 border rounded"
            >
              {[1, 2, 3, 4].map((w) => (
                <option key={w} value={w}>
                  Week {w}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label className="block">
            Select Day:
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="ml-2 p-1 border rounded"
            >
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(
                (d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                )
              )}
            </select>
          </label>
        </div>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      {schedule.length > 0 ? (
        <ul className="list-disc pl-5">
          {schedule.map((item: any, index: number) => (
            <li key={index} className="my-2">
              {item.business_name}
            </li>
          ))}
        </ul>
      ) : (
        <p>No schedule available for the selected day.</p>
      )}
    </div>
  );
};

export default Hero2;