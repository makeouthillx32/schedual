"use client";

import { useState, useEffect } from "react";
import WeekList from "@/components/WeekList";
import { fetchSchedule } from "@/components/fetchSchedule";
import { useTheme } from "@/app/provider";

interface Job {
  job_name: string;
  member_name: string;
}

interface ScheduleItem {
  business_name: string;
  jobs: Job[];
  before_open: boolean;
  address: string;
}

interface GroupedSchedule {
  [day: string]: ScheduleItem[];
}

const Hero2: React.FC = () => {
  const { themeType } = useTheme();
  const [week, setWeek] = useState<number>(1);
  const [schedule, setSchedule] = useState<GroupedSchedule>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  const loadWeeklySchedule = async () => {
    setLoading(true);
    try {
      const groupedSchedules: GroupedSchedule = {};

      for (const day of days) {
        const data = await fetchSchedule(week, day.toLowerCase());
        groupedSchedules[day] = data.schedule || [];
      }

      setSchedule(groupedSchedules);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch schedule.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeeklySchedule();
  }, [week]);

  return (
    <div
      className="p-5"
      style={{
        backgroundColor: "var(--app-background)",
        color: "var(--app-foreground)",
      }}
    >
      {/* Week Selection */}
      <div className="flex flex-col mb-5 space-y-4">
        <div>
          <label
            htmlFor="week-selector"
            className="block mb-2 font-bold"
          >
            Select Week:
          </label>
          <select
            id="week-selector"
            title="Week Selector"
            value={week}
            onChange={(e) => setWeek(Number(e.target.value))}
            className="p-2 border rounded"
            style={{
              backgroundColor: "var(--app-muted)",
              color: "var(--app-foreground)",
              borderColor: "var(--app-border)",
            }}
          >
            <option value={1}>Week 1</option>
            <option value={2}>Week 2</option>
            <option value={3}>Week 3</option>
            <option value={4}>Week 4</option>
            <option value={5}>Week 5</option>
          </select>
        </div>
      </div>

      {/* Conditional Rendering */}
      {loading ? (
        <div className="text-center">Loading schedule...</div>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <WeekList groupedSchedule={schedule} />
      )}
    </div>
  );
};

export default Hero2;
