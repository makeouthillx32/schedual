"use client";

import { useState } from "react";

export default function Page() {
  const [week, setWeek] = useState("1");
  const [day, setDay] = useState("monday");
  const [schedule, setSchedule] = useState<string[] | null>(null);

  const fetchSchedule = async () => {
    try {
      const response = await fetch(`/api/get-schedule?week=${week}&day=${day}`);
      const data = await response.json();
      setSchedule(data.schedule || []);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      setSchedule([]);
    }
  };

  return (
    <div>
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
        <button style={{ marginLeft: "10px" }} onClick={fetchSchedule}>
          Get Schedule
        </button>
      </div>
      <h3>Results:</h3>
      <ul>
        {schedule
          ? schedule.map((item, index) => <li key={index}>{item}</li>)
          : "No results found"}
      </ul>
    </div>
  );
}