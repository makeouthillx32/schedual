"use client";

import { useState, useEffect } from "react";
import { members } from "../lib/members"; // Import members

interface JobSchedule {
  business_name: string;
  jobs: { job_name: string; member_name: string }[];
}

// State to track the last assigned job index for each member
const rotationState: { [key: string]: number } = {};

// Initialize `rotationState`
members.forEach((member) => {
  rotationState[member.name] = -1; // Start with no job assigned
});

export default function Page() {
  const [week, setWeek] = useState<number>(0); // Default week placeholder
  const [day, setDay] = useState<string>(""); // Default day placeholder
  const [schedule, setSchedule] = useState<JobSchedule[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const assignMembersToJobs = (jobs: string[], day: string) => {
    console.log("Members Data:", members); // Debugging
    const assignedJobs = jobs.map((job) => {
      const availableMembers = members.filter(
        (member) => member[day as keyof typeof member]
      );
  
      console.log("Available Members for Day:", day, availableMembers); // Debugging
  
      if (availableMembers.length === 0) {
        return { job_name: job, member_name: "No available members" };
      }
  
      const nextMemberIndex =
        (rotationState[job] + 1) % availableMembers.length;
      const assignedMember = availableMembers[nextMemberIndex]?.name;
  
      if (!assignedMember) {
        return { job_name: job, member_name: "Unassigned" };
      }
  
      rotationState[job] = nextMemberIndex;
  
      return { job_name: job, member_name: assignedMember };
    });
  
    console.log("Rotation State:", rotationState); // Debugging
  
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
    setIsLoading(true);
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
        jobs: assignMembersToJobs(
          ["Sweep and Mop", "Vacuum", "Bathrooms and Trash"],
          day
        ),
      }));

      setSchedule(updatedSchedule);
    } catch (err: any) {
      console.error("Error fetching schedule:", err);
      setError(err.message);
      setSchedule([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (week > 0 && day) {
      fetchSchedule();
    }
  }, [week, day]);

  if (isLoading) {
    return <p>Loading schedule...</p>;
  }

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
