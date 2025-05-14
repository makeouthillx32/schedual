"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { toast } from "react-hot-toast";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const days = ["monday", "tuesday", "wednesday", "thursday", "friday"] as const;
type DayKey = (typeof days)[number];

interface Member {
  id?: number;
  name: string;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  delete?: boolean;
}

export default function ModifyMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [newMemberName, setNewMemberName] = useState("");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("Members")
        .select("id, name, monday, tuesday, wednesday, thursday, friday");
      if (error) toast.error(error.message);
      if (data) setMembers(data);
    })();
  }, []);

  const toggleDay = (index: number, day: DayKey) => {
    setMembers((prev) =>
      prev.map((member, i) =>
        i === index ? { ...member, [day]: !member[day] } : member
      )
    );
  };

  const handleDelete = (index: number) => {
    setMembers((prev) =>
      prev.map((m, i) => (i === index ? { ...m, delete: true } : m))
    );
  };

  const handleAddMember = () => {
    if (!newMemberName.trim()) return;
    setMembers((prev) => [
      ...prev,
      {
        name: newMemberName,
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
      },
    ]);
    setNewMemberName("");
  };

  const saveChanges = async () => {
    const response = await fetch("/api/schedule", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberUpdates: members }),
    });

    if (response.ok) {
      toast.success("Member updates saved!");
    } else {
      const { error } = await response.json();
      toast.error(error || "Failed to save changes.");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Modify Members</h2>

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          className="border rounded p-2 w-full"
          placeholder="New member name"
          value={newMemberName}
          onChange={(e) => setNewMemberName(e.target.value)}
        />
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={handleAddMember}
        >
          Add Member
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {members.map((member, index) =>
          member.delete ? null : (
            <div
              key={member.id ?? `new-${index}`}
              className="border rounded p-4 shadow-sm bg-white dark:bg-gray-800"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-lg text-blue-600">
                  {member.name || "(New Member)"}
                </h3>
                {member.id && (
                  <button
                    className="text-red-600 hover:text-red-800 text-sm"
                    onClick={() => handleDelete(index)}
                  >
                    Delete
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-4">
                {days.map((day) => (
                  <label
                    key={day}
                    className="flex items-center gap-2 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={member[day]}
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
          )
        )}
      </div>

      <button
        className="mt-6 px-6 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700"
        onClick={saveChanges}
      >
        Save Changes
      </button>
    </div>
  );
}