"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function ManualRoleEditor() {
  const [uuid, setUuid] = useState("");
  const [roleId, setRoleId] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);

  useEffect(() => {
    const fetchAllUsers = async () => {
      const res = await fetch("/api/get-all-users");
      const data = await res.json();
      if (res.ok) setUsers(data);
    };
    const fetchAllRoles = async () => {
      const res = await fetch("/api/roles");
      const data = await res.json();
      if (res.ok) setRoles(data);
    };

    fetchAllUsers();
    fetchAllRoles();
  }, []);

  const selectedUser = users.find((user) => user.id === uuid);
  const selectedRole = roles.find((r) => r.id === roleId);

  const handleUpdateRole = async () => {
    if (!uuid || !roleId) return;
    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/profile/set-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uuid, roleId }),
    });

    const result = await res.json();
    if (res.ok) {
      setMessage(`✅ Role updated to '${selectedRole?.name}' for user ${selectedUser?.display_name}.`);
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
        className="w-full mb-4 p-2 rounded border bg-white dark:bg-zinc-700 text-black dark:text-white"
        value={uuid}
        onChange={(e) => setUuid(e.target.value)}
      >
        <option value="">Select a user</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.display_name || user.email || user.id}
          </option>
        ))}
      </select>

      <Label htmlFor="role">Role</Label>
      <select
        id="role"
        className="w-full mb-4 p-2 rounded border bg-white dark:bg-zinc-700 text-black dark:text-white"
        value={roleId}
        onChange={(e) => setRoleId(e.target.value)}
      >
        <option value="">Select a role</option>
        {roles.map((role) => (
          <option key={role.id} value={role.id}>
            {role.name}
          </option>
        ))}
      </select>

      <Button onClick={handleUpdateRole} disabled={loading} className="w-full">
        {loading ? "Updating..." : "Update Role"}
      </Button>

      {message && <p className="text-center mt-4 text-sm">{message}</p>}
    </div>
  );
}