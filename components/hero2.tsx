"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/app/provider"; // Ensures theme consistency

const Hero2: React.FC = () => {
  const [week, setWeek] = useState<number>(1);
  const [day, setDay] = useState<string>("Monday");
  const [schedule, setSchedule] = useState<
    { business_name: string; address: string; before_open: boolean; jobs: string[] }[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  const { themeType } = useTheme();

  // Fetch schedule from the new API route
  const fetchSchedule = async (week: number, day: string) => {
    try {
      const res = await fetch(`/api/schedule/route2?week=${week}&day=${day}`);
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      const data = await res.json();
      if (data.schedule.length === 0) {
        setError("No schedule available for the selected day.");
      } else {
        setError(null); // Clear previous errors
      }
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    const loadSchedule = async () => {
      try {
        const data = await fetchSchedule(week, day);
        setSchedule(data.schedule);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch schedule.");
      }
    };

    loadSchedule();
  }, [week, day]);

  return (
    <div
      className={`p-5 ${
        themeType === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}
    >
      <h2 className="text-2xl font-bold mb-4">CMS Schedule App</h2>
      <div className="flex gap-4 mb-5">
        <div>
          <label className="block text-sm font-medium mb-1">Select Week:</label>
          <select
            value={week}
            onChange={(e) => setWeek(Number(e.target.value))}
            className="border rounded p-2"
          >
            <option value={1}>Week 1</option>
            <option value={2}>Week 2</option>
            <option value={3}>Week 3</option>
            <option value={4}>Week 4</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Select Day:</label>
          <select
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="border rounded p-2"
          >
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
          </select>
        </div>
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div>
        <h3 className="text-lg font-semibold mb-2">Schedule:</h3>
        {schedule.length > 0 ? (
          <ul className="space-y-4">
            {schedule.map((entry, index) => (
              <li key={index} className="border rounded p-4">
                <h4 className="font-bold text-lg">{entry.business_name}</h4>
                <p>{entry.address}</p>
                <p>
                  <strong>Before Open:</strong>{" "}
                  {entry.before_open ? "Yes" : "No"}
                </p>
                <ul className="mt-2">
                  {entry.jobs.map((job, idx) => (
                    <li key={idx} className="list-disc ml-5">
                      {job}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        ) : (
          <p>No data available for the selected week and day.</p>
        )}
      </div>
    </div>
  );
};

export default Hero2;