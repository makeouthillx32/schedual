"use client";

import { useState } from "react";

export default function Page() {
  const [week, setWeek] = useState("1");
  const [day, setDay] = useState("monday");
  const [schedule, setSchedule] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedule = async () => {
    setError(null); // Clear previous errors
    try {
      console.log(`Fetching schedule for Week ${week}, Day ${day}`);
      const response = await fetch(`/api/get-schedule?week=${week}&day=${day}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Response Data:", data);
      setSchedule(data.schedule || []);
    } catch (err) {
      console.error("Error fetching schedule:", err);
      setError(err.message);
      setSchedule(null);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Select Week and Day</h2>
      <div style={{ marginBottom: "20px" }}>
        <label>
          Week:
          <select value={week} onChange={(e) => setWeek(e.target.value)}>
            <option value="1">Week 1</option>
            <option value="2">Week 2</option>
            <option value="3">Week 3</option>
            <option value="4">Week 4</option>
          </select>
        </label>
        <label style={{ marginLeft: "10px" }}>
          Day:
          <select value={day} onChange={(e) => setDay(e.target.value)}>
            <option value="monday">Monday</option>
            <option value="tuesday">Tuesday</option>
            <option value="wednesday">Wednesday</option>
            <option value="thursday">Thursday</option>
            <option value="friday">Friday</option>
          </select>
        </label>
        <button
          style={{
            marginLeft: "10px",
            padding: "5px 15px",
            background: "#0070f3",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={fetchSchedule}
        >
          Get Schedule
        </button>
      </div>
      <h3>Results:</h3>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      <ul>
        {schedule && schedule.length > 0 ? (
          schedule.map((item, index) => <li key={index}>{item}</li>)
        ) : (
          <li>No results found</li>
        )}
      </ul>
    </div>
  );
}
