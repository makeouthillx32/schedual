"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ManualRoleEditor() {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState("");
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
    if (!selectedId || !role) return;
    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/profile/set-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uuid: selectedId, role }),
    });

    const result = await res.json();
    if (res.ok) {
      setMessage(`✅ Role updated to '${role}' for user.`);
    } else {
      setMessage(`❌ ${result.error || "Failed to update role."}`);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white dark:bg-zinc-800 p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-center">Manually Set User Role</h2>

      <Label htmlFor="uuid">User Display Name</Label>
      <select
        className="w-full mb-4 p-2 rounded border bg-white dark:bg-zinc-700 text-black dark:text-white"
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
      >
        <option value="">Select user</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.user_metadata?.display_name || user.email || user.id}
          </option>
        ))}
      </select>

      <Label htmlFor="role">New Role</Label>
      <select
        id="role"
        className="w-full mb-4 p-2 rounded border bg-white dark:bg-zinc-700 text-black dark:text-white"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="">Select role</option>
        <option value="admin">Admin</option>
        <option value="job_coach">Job Coach</option>
        <option value="client">Client</option>
        <option value="anonymous">Anonymous</option>
      </select>

      <Button onClick={handleUpdateRole} disabled={loading} className="w-full">
        {loading ? "Updating..." : "Update Role"}
      </Button>

      {message && <p className="text-center mt-4 text-sm">{message}</p>}
    </div>
  );
}
