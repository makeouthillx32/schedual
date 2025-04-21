"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function BusinessManager() {
  const [mode, setMode] = useState<"add" | "delete">("add");
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [beforeOpen, setBeforeOpen] = useState(false);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    const res = await fetch("/api/schedule/businesses");
    const data = await res.json();
    setBusinesses(data);
  };

  const handleAdd = async () => {
    const res = await fetch("/api/schedule/businesses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ business_name: name, address, before_open: beforeOpen }),
    });

    if (res.ok) {
      toast.success("Business added");
      fetchBusinesses();
      setName("");
      setAddress("");
      setBeforeOpen(false);
    } else {
      toast.error("Failed to add business");
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return toast.error("Select a business to delete");

    const res = await fetch("/api/schedule/businesses", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selectedId }),
    });

    if (res.ok) {
      toast.success("Business deleted");
      fetchBusinesses();
      setSelectedId(null);
    } else {
      toast.error("Failed to delete business");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-4 border rounded-md shadow mt-8">
      <div className="flex gap-4 mb-4">
        <button
          className={`px-4 py-2 rounded ${mode === "add" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-800"}`}
          onClick={() => setMode("add")}
        >
          Add Business
        </button>
        <button
          className={`px-4 py-2 rounded ${mode === "delete" ? "bg-red-600 text-white" : "bg-gray-200 dark:bg-gray-800"}`}
          onClick={() => setMode("delete")}
        >
          Delete Business
        </button>
      </div>

      {mode === "add" ? (
        <div className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Business Name"
            className="w-full p-2 border rounded dark:bg-gray-800"
          />
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Address"
            className="w-full p-2 border rounded dark:bg-gray-800"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={beforeOpen}
              onChange={(e) => setBeforeOpen(e.target.checked)}
              className="accent-blue-600"
            />
            Clean before open?
          </label>
          <button
            onClick={handleAdd}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Business
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <select
            className="w-full p-2 border rounded dark:bg-gray-800"
            value={selectedId ?? ""}
            onChange={(e) => setSelectedId(parseInt(e.target.value))}
          >
            <option value="">Select a business</option>
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.business_name}
              </option>
            ))}
          </select>
          <button
            onClick={handleDelete}
            className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete Business
          </button>
        </div>
      )}
    </div>
  );
}
