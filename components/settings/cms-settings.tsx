"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday"];

export default function CMSSettings() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [schedule, setSchedule] = useState<any>({});

  useEffect(() => {
    const fetchBusinesses = async () => {
      const { data } = await supabase.from("Businesses").select("id, business_name");
      setBusinesses(data || []);
    };
    fetchBusinesses();
  }, []);

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!selectedId) return;
      const { data } = await supabase.from("Schedule").select("*").eq("business_id", selectedId).single();
      setSchedule(data || {});
    };
    fetchSchedule();
  }, [selectedId]);

  const handleCheckboxChange = (day: string) => {
    setSchedule((prev: any) => ({ ...prev, [day]: !prev[day] }));
  };

  const handleSave = async () => {
    if (!selectedId) return;
    const update = weekdays.reduce((acc, day) => {
      acc[day] = schedule[day] || false;
      return acc;
    }, {} as any);
    await supabase.from("Schedule").update(update).eq("business_id", selectedId);
    alert("Schedule updated successfully.");
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">CMS Schedule Manager</h2>
      <select
        className="w-full p-2 mb-4 border rounded"
        onChange={(e) => setSelectedId(e.target.value)}
        value={selectedId}
      >
        <option value="">Select a business</option>
        {businesses.map((b) => (
          <option key={b.id} value={b.id}>{b.business_name}</option>
        ))}
      </select>

      {selectedId && (
        <div className="space-y-2">
          {weekdays.map((day) => (
            <label key={day} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={schedule[day] || false}
                onChange={() => handleCheckboxChange(day)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="capitalize">
                {day} {schedule[day] ? "✔️" : "❌"}
              </span>
            </label>
          ))}
          <button
            onClick={handleSave}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
}
