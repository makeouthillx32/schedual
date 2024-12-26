"use client";

import { useState, useEffect } from "react";
import { members } from "../lib/members"; // Import members

interface JobSchedule {
  business_name: string;
  jobs: { job_name: string; member_name: string }[];
}

// Initialize rotation state
const memberLastJob: { [key: string]: number } = {};

// Initialize `memberLastJob`
members.forEach((member) => {
  memberLastJob[member.name] = -1; // Start with no job assigned
});

export default function Page() {
  const [week, setWeek] = useState<number>(0); // Default week placeholder
  const [day, setDay] = useState<string>(""); // Default day placeholder
  const [schedule, setSchedule] = useState<JobSchedule[]>([]);
  const [error, setError] = useState<string | null>(null);

  const assignMembersToJobs = (jobs: string[]) => {
    const assignedJobs = jobs.map((job) => {
      let assignedMember = null;

      // Get available members for the current day
      const availableMembers = members.filter(
        (member) => member[day as keyof typeof member]
      );

      // Rotate members fairly
      if (availableMembers.length > 0) {
        // Find the member with the least recent job
        availableMembers.sort(
          (a, b) => memberLastJob[a.name] - memberLastJob[b.name]
        );
        assignedMember = availableMembers[0].name;

        // Update the member's last job index
        memberLastJob[assignedMember] =
          (memberLastJob[assignedMember] + 1) % jobs.length;
      }

      return { job_name: job, member_name: assignedMember || "Unassigned" };
    });

    return assignedJobs;
  };

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

      // Assign members to jobs for each business
      const updatedSchedule = data.schedule.map((entry: any) => ({
        business_name: entry.business_name,
        jobs: assignMembersToJobs(["Sweep and Mop", "Vacuum", "Bathrooms and Trash"]),
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

  return (
    <div style={{ padding: "20px" }}>
      <h2>
        Week {week} - {day.charAt(0).toUpperCase() + day.slice(1)}
      </h2>
      <h3>Results:</h3>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      <div>
        {schedule.length > 0 ? (
          schedule.map((entry, index) => (
            <div key={index} style={{ marginBottom: "20px" }}>
              <h4>{entry.business_name}</h4>
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
    </div>
  );
}
