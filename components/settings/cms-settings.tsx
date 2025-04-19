"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const days = ["monday", "tuesday", "wednesday", "thursday", "friday"];

export default function CMSSettings() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBusinesses = async () => {
      const { data, error } = await supabase.from("Businesses").select("id, business_name");
      if (data) setBusinesses(data);
    };
    fetchBusinesses();
  }, []);

  const fetchSchedule = async (businessId: number) => {
    setLoading(true);
    const { data } = await supabase
      .from("Schedule")
      .select("id, week, monday, tuesday, wednesday, thursday, friday")
      .eq("business_id", businessId)
      .order("week");
    setSchedule(data || []);
    setLoading(false);
  };

  const toggleDay = (weekIndex: number, day: string) => {
    setSchedule((prev) => {
      const newSchedule = [...prev];
      newSchedule[weekIndex][day] = !newSchedule[weekIndex][day];
      return newSchedule;
    });
  };

  const saveChanges = async () => {
    setLoading(true);
    for (const entry of schedule) {
      const { id, ...fields } = entry;
      await supabase.from("Schedule").update(fields).eq("id", id);
    }
    setLoading(false);
    alert("Schedule updated!");
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">CMS Cleaning Schedule Settings</h2>

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

      {schedule.map((weekData, index) => (
        <div key={weekData.id} className="border rounded p-3 mb-4">
          <h3 className="font-semibold mb-2">Week {weekData.week}</h3>
          <div className="grid grid-cols-5 gap-2">
            {days.map((day) => (
              <label key={day} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={weekData[day]}
                  onChange={() => toggleDay(index, day)}
                />
                <span className="capitalize">{day}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      {selectedId && (
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={saveChanges}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      )}
    </div>
  );
}
