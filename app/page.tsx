"use client";

import { useState, useEffect } from "react";
import { members } from "../lib/members"; // Import members

interface JobSchedule {
  business_name: string;
  jobs: { job_name: string; member_name: string }[];
  before_open: boolean;
  address: string;
}

export default function Page() {
  const [week, setWeek] = useState<number>(0); // Default week placeholder
  const [day, setDay] = useState<string>(""); // Default day placeholder
  const [schedule, setSchedule] = useState<JobSchedule[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [toastInfo, setToastInfo] = useState<{
    business_name: string;
    before_open: boolean;
    address: string;
  } | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const assignRandomJobs = (jobs: string[], availableMembers: typeof members) => {
    const shuffledMembers = [...availableMembers].sort(() => Math.random() - 0.5);
    const assignedJobs: { job_name: string; member_name: string }[] = [];

    let memberIndex = 0; // Ensure all members are used at least once
    jobs.forEach((job) => {
      const assignedMember = shuffledMembers[memberIndex];
      assignedJobs.push({ job_name: job, member_name: assignedMember.name });
      memberIndex = (memberIndex + 1) % shuffledMembers.length; // Wrap around
    });

    return assignedJobs;
  };

  useEffect(() => {
    const today = new Date();
    const currentDay = today.toLocaleString("en-US", { weekday: "long" }).toLowerCase();
    const currentWeek = Math.ceil(today.getDate() / 7);

    setDay(currentDay);
    setWeek(currentWeek);

    // Simulate a theme toggle based on time for testing
    const hour = today.getHours();
    setTheme(hour >= 18 || hour < 6 ? "dark" : "light");
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

      // Filter members based on their availability for the day
      const availableMembers = members.filter(
        (member) => member[day as keyof typeof member]
      );
      console.log("Available Members:", availableMembers);

      // Assign random jobs for each business
      const updatedSchedule = data.schedule.map((entry: any) => ({
        business_name: entry.business_name,
        before_open: entry.before_open,
        address: entry.address,
        jobs: assignRandomJobs(
          ["Sweep and Mop", "Vacuum", "Bathrooms and Trash"],
          availableMembers
        ),
      }));

      setSchedule(updatedSchedule);
    } catch (err: any) {
      console.error("Error fetching schedule:", err);
      setError(err.message);
      setSchedule([]);
    }
  };

  useEffect(() => {
    if (week > 0 && day) {
      fetchSchedule();
    }
  }, [week, day]);

  const backgroundColor = theme === "dark" ? "#121212" : "#f5f5f5";
  const textColor = theme === "dark" ? "#ffffff" : "#000000";

  return (
    <div
      style={{
        padding: "20px",
        background: backgroundColor,
        color: textColor,
        minHeight: "100vh", // Ensure the background covers the entire viewport
      }}
    >
      <h2>
        Week {week} - {day.charAt(0).toUpperCase() + day.slice(1)}
      </h2>
      <h3>Results:</h3>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      <div>
        {schedule.length > 0 ? (
          schedule.map((entry, index) => (
            <div key={index} style={{ marginBottom: "20px" }}>
              <h4
                style={{
                  cursor: "pointer",
                  textDecoration: "underline",
                  color: textColor,
                }}
                onClick={() =>
                  setToastInfo({
                    business_name: entry.business_name,
                    before_open: entry.before_open,
                    address: entry.address,
                  })
                }
              >
                {entry.business_name}
              </h4>
              <ul>
                {entry.jobs.map((job, jobIndex) => (
                  <li key={jobIndex}>
                    {job.job_name} - {job.member_name}
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <p>No results found</p>
        )}
      </div>

      {/* Toast Window */}
      {toastInfo && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            padding: "20px",
            background: theme === "dark" ? "#333333" : "#ffffff",
            border: theme === "dark" ? "1px solid #444" : "1px solid #ccc",
            borderRadius: "10px",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)",
            zIndex: 1000,
            color: theme === "dark" ? "#ffffff" : "#000000",
          }}
        >
          <button
            onClick={() => setToastInfo(null)}
            style={{
              position: "absolute",
              top: "5px",
              right: "5px",
              background: "red",
              color: "#ffffff",
              border: "none",
              borderRadius: "50%",
              width: "20px",
              height: "20px",
              cursor: "pointer",
              textAlign: "center",
              lineHeight: "20px",
            }}
          >
            X
          </button>
          <h4>{toastInfo.business_name}</h4>
          <p>
            <strong>Address:</strong> {toastInfo.address}
          </p>
          <p>
            <strong>Before Open:</strong>{" "}
            {toastInfo.before_open ? "Yes" : "No"}
          </p>
        </div>
      )}
    </div>
  );
}
