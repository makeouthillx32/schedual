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

  const randomizeSchedule = () => {
    const availableMembers = members.filter(
      (member) => member[day as keyof typeof member]
    );

    const randomizedSchedule = schedule.map((entry) => ({
      ...entry,
      jobs: assignRandomJobs(
        ["Sweep and Mop", "Vacuum", "Bathrooms and Trash"],
        availableMembers
      ),
    }));

    setSchedule(randomizedSchedule);
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

  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold">
          Week {week} - {day.charAt(0).toUpperCase() + day.slice(1)}
        </h2>
        <button
          onClick={randomizeSchedule}
          className="p-2 bg-blue-500 text-white rounded"
        >
          Randomize Jobs
        </button>
      </div>
      <h3 className="text-lg font-semibold mt-4">Results:</h3>
      {error && <p className="text-red-500">Error: {error}</p>}
      <div>
        {schedule.length > 0 ? (
          schedule.map((entry, index) => (
            <div key={index} className="mb-6">
              <h4
                className="underline cursor-pointer"
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
              <ul className="ml-5 list-disc">
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
          className="fixed top-5 right-5 p-5 rounded-lg shadow-lg max-w-xs w-full"
          style={{
            backgroundColor: "var(--card)",
            color: "var(--card-foreground)",
            border: "1px solid var(--border)",
            zIndex: 1000,
          }}
        >
          <button
            onClick={() => setToastInfo(null)}
            className="absolute top-2 right-2 w-5 h-5 rounded-full bg-red-500 text-white text-center flex items-center justify-center"
          >
            X
          </button>
          <h4 className="text-lg font-bold">{toastInfo.business_name}</h4>
          <p className="mt-2">
            <strong>Address:</strong>{" "}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                toastInfo.address
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              {toastInfo.address}
            </a>
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
