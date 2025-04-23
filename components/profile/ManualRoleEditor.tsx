"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function ManualRoleEditor() {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedDisplayName, setSelectedDisplayName] = useState("");
  const [uuid, setUuid] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch("/api/get-all-users");
      const data = await res.json();
      if (res.ok) setUsers(data);
    };
    fetchUsers();
  }, []);

  const handleUpdateRole = async () => {
    const selectedUser = users.find((user) => user.display_name === selectedDisplayName);
    if (!selectedUser || !role) return;
    setUuid(selectedUser.id);
    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/profile/set-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uuid: selectedUser.id, role }),
    });

    const result = await res.json();
    if (res.ok) {
      setMessage(`✅ Role updated to '${role}' for ${selectedDisplayName}.`);
    } else {
      setMessage(`❌ ${result.error || "Failed to update role."}`);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white dark:bg-zinc-800 p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-center">Manually Set User Role</h2>

      <Label htmlFor="user">Select User</Label>
      <select
        id="user"
        className="mb-4 p-2 rounded border w-full dark:bg-zinc-900 text-black dark:text-white"
        value={selectedDisplayName}
        onChange={(e) => setSelectedDisplayName(e.target.value)}
      >
        <option value="">Select a display name</option>
        {users.map((user) => (
          <option key={user.id} value={user.display_name}>
            {user.display_name || user.id}
          </option>
        ))}
      </select>

      <Label htmlFor="role">New Role</Label>
      <select
        id="role"
        className="mb-4 p-2 rounded border w-full dark:bg-zinc-900 text-black dark:text-white"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="">Select role</option>
        <option value="admin">admin</option>
        <option value="job_coach">job_coach</option>
        <option value="client">client</option>
        <option value="anonymous">anonymous</option>
      </select>

      <Button onClick={handleUpdateRole} disabled={loading} className="w-full">
        {loading ? "Updating..." : "Update Role"}
      </Button>

      {message && <p className="text-center mt-4 text-sm">{message}</p>}
    </div>
  );
}
