"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { toast } from "react-hot-toast";

/** ─────────────────────────────────────────
 *  Supabase set‑up
 *  ───────────────────────────────────────── */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/** columns that represent days (lower‑case DB) */
const days = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
] as const;

type DayKey = (typeof days)[number];

type ScheduleRow = {
  id: number;
  week: number;
  business_id: number;
} & Record<DayKey, boolean>;

export default function CMSSettings() {
  /* ─────────── state ─────────── */
  const [businesses, setBusinesses] = useState<
    { id: number; business_name: string }[]
  >([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [schedule, setSchedule] = useState<ScheduleRow[]>([]);
  const [loading, setLoading] = useState(false);

  /* ─────────── fetch businesses on mount ─────────── */
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("Businesses")
        .select("id, business_name")
        .order("business_name");
      if (error) toast.error(error.message);
      if (data) setBusinesses(data);
    })();
  }, []);

  /* ─────────── load schedule for selected business ─────────── */
  const fetchSchedule = async (businessId: number) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("Schedule")
      .select(
        "id, week, business_id, monday, tuesday, wednesday, thursday, friday"
      )
      .eq("business_id", businessId)
      .order("week");

    if (error) toast.error(error.message);
    setSchedule((data as ScheduleRow[]) || []);
    setLoading(false);
  };

  /* ─────────── toggle helper ───────────
   *  Each week can have MULTIPLE cleaning days.
   *  Toggling a checkbox simply flips its boolean.
   *  ───────────────────────────────────────── */
  const toggleDay = (weekIndex: number, day: DayKey) => {
    setSchedule((prev) =>
      prev.map((row, i) =>
        i === weekIndex ? { ...row, [day]: !row[day] } : row
      )
    );
  };

  /* ─────────── persist edits ─────────── */
  const saveChanges = async () => {
    setLoading(true);

    const updates = schedule.map(async (row) => {
      const { id, ...fields } = row;
      const updatePayload: Partial<ScheduleRow> = {};
      days.forEach((d) => (updatePayload[d] = fields[d]));
      return supabase.from("Schedule").update(updatePayload).eq("id", id);
    });

    const results = await Promise.all(updates);
    const error = results.find((r) => r.error)?.error;
    if (error) toast.error(error.message);
    else toast.success("Schedule updated!");

    setLoading(false);
  };

  /* ─────────── UI ─────────── */
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">CMS Cleaning Schedule Settings</h2>

      {/* selector */}
      <select
        className="mb-4 border p-2"
        onChange={(e) => {
          const id = parseInt(e.target.value);
          setSelectedId(id);
          fetchSchedule(id);
        }}
        defaultValue=""
      >
        <option value="" disabled>
          Select a business
        </option>
        {businesses.map((b) => (
          <option key={b.id} value={b.id}>
            {b.business_name}
          </option>
        ))}
      </select>

      {loading && <p>Loading...</p>}

      <div className="flex flex-col gap-4">
        {schedule.map((weekData, index) => (
          <div
            key={weekData.id}
            className="border rounded p-4 shadow-sm bg-white dark:bg-gray-800"
          >
            <h3 className="font-semibold mb-2 text-lg text-blue-600">
              Week {weekData.week}
            </h3>
            <div className="flex flex-wrap gap-4">
              {days.map((day) => (
                <label
                  key={day}
                  className="flex items-center gap-2 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={weekData[day]}
                    onChange={() => toggleDay(index, day)}
                    className="accent-blue-600 w-4 h-4"
                  />
                  <span className="capitalize text-sm text-gray-700 dark:text-gray-200">
                    {day}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedId && schedule.length > 0 && (
        <button
          className="mt-6 px-6 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 disabled:opacity-50"
          onClick={saveChanges}
          disabled={loading}
        >
          {loading ? "Saving…" : "Save Changes"}
        </button>
      )}
    </div>
  );
}
