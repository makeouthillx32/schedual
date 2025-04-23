"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function ManualRoleEditor() {
  const [uuid, setUuid] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpdateRole = async () => {
    if (!uuid || !role) return;
    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/profile/set-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uuid, role }),
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

      <Label htmlFor="uuid">User UUID</Label>
      <Input
        id="uuid"
        placeholder="Paste user UUID"
        className="mb-4"
        value={uuid}
        onChange={(e) => setUuid(e.target.value)}
      />

      <Label htmlFor="role">New Role</Label>
      <Input
        id="role"
        placeholder="Enter new role (e.g. admin, job_coach)"
        className="mb-4"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      />

      <Button onClick={handleUpdateRole} disabled={loading} className="w-full">
        {loading ? "Updating..." : "Update Role"}
      </Button>

      {message && <p className="text-center mt-4 text-sm">{message}</p>}
    </div>
  );
}
