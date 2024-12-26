"use client";

import { useState, useEffect } from "react";

interface Job {
  business_name: string;
  job_type: string;
  member_name: string;
}

export default function Page() {
  const [week, setWeek] = useState<number>(0); // Default week placeholder
  const [day, setDay] = useState<string>(""); // Default day placeholder
  const [schedule, setSchedule] = useState<Job[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Automatically determine the current week and day
  useEffect(() => {
    const today = new Date();
    const currentDay = today.toLocaleString("en-US", { weekday: "long" }).toLowerCase();
    const currentWeek = Math.ceil(today.getDate() / 7);

    setDay(currentDay);
    setWeek(currentWeek);
  }, []);

  const fetchSchedule = async () => {
    setError(null);
    try {
      console.log(`Fetching schedule for Week ${week}, Day ${day}`);
      const response = await fetch(`/api/schedule?week=${week}&day=${day}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Response Data:", data);
      setSchedule(data.schedule || []);
    } catch (err: any) {
      console.error("Error fetching schedule:", err);
      setError(err.message);
      setSchedule([]);
    }
  };

  // Fetch schedule whenever week or day changes
  useEffect(() => {
    if (week > 0 && day) {
      fetchSchedule();
    }
  }, [week, day]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>
        Week {week} - {day.charAt(0).toUpperCase() + day.slice(1)}
      </h2>
      <h3>Results:</h3>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      <div>
        {schedule.length > 0 ? (
          schedule.map((job, index) => (
            <div key={index} style={{ marginBottom: "20px" }}>
              <h4>{job.business_name}</h4>
              <ul>
                <li>
                  {job.job_type} - {job.member_name}
                </li>
              </ul>
            </div>
          ))
        ) : (
          <p>No results found</p>
        )}
      </div>
    </div>
  );
}
