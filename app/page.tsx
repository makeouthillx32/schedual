"use client";

import { useState, useEffect } from "react";
import { fetchSchedule } from "@/components/fetchSchedule";
import { assignRandomJobs } from "@/components/assignRandomJobs";
import Toast from "@/components/Toast";
import ScheduleList from "@/components/ScheduleList";
import RandomizerButton from "@/components/RandomizerButton";
import { members } from "../lib/members";

interface JobSchedule {
  business_name: string;
  jobs: { job_name: string; member_name: string }[];
  before_open: boolean;
  address: string;
}

export default function Page() {
  const [week, setWeek] = useState<number>(0);
  const [day, setDay] = useState<string>("");
  const [schedule, setSchedule] = useState<JobSchedule[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [toastInfo, setToastInfo] = useState<{
    business_name: string;
    before_open: boolean;
    address: string;
  } | null>(null);

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

  const loadSchedule = async () => {
    try {
      const data = await fetchSchedule(week, day);
      const availableMembers = members.filter(
        (member) => member[day as keyof typeof member]
      );

      const updatedSchedule = data.schedule.map((entry: any) => ({
        ...entry,
        jobs: assignRandomJobs(
          ["Sweep and Mop", "Vacuum", "Bathrooms and Trash"],
          availableMembers
        ),
        onClick: () => setToastInfo(entry),
      }));

      setSchedule(updatedSchedule);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
    }
  };

  useEffect(() => {
    if (week > 0 && day) loadSchedule();
  }, [week, day]);

  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold">
          Week {week} - {day.charAt(0).toUpperCase() + day.slice(1)}
        </h2>
        <RandomizerButton onClick={randomizeSchedule} />
      </div>
      <h3 className="text-lg font-semibold mt-4">Results:</h3>
      {error && <p className="text-red-500">Error: {error}</p>}
      <ScheduleList
        schedule={schedule.map((entry) => ({
          ...entry,
          onClick: () =>
            setToastInfo({
              business_name: entry.business_name,
              before_open: entry.before_open,
              address: entry.address,
            }),
        }))}
      />
      {toastInfo && <Toast {...toastInfo} onClose={() => setToastInfo(null)} />}
    </div>
  );
}
