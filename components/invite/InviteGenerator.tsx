"use client";

import { useState } from "react";

export default function InviteGenerator() {
  const [role, setRole] = useState("client");
  const [inviteLink, setInviteLink] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerateInvite = async () => {
    setLoading(true);
    setInviteLink("");

    const res = await fetch("/api/invite/create", {
      method: "POST",
      body: JSON.stringify({ role }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (data.inviteLink) {
      setInviteLink(data.inviteLink);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto bg-card text-card-foreground p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Generate Invite Link</h2>

      <label className="block mb-2 font-medium">Select Role:</label>
      <select
        className="w-full mb-4 p-2 rounded border"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="admin">Admin</option>
        <option value="job_coach">Job Coach</option>
        <option value="client">Client</option>
        <option value="anonymous">Anonymous</option>
      </select>

      <button
        onClick={handleGenerateInvite}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Invite"}
      </button>

      {inviteLink && (
        <div className="mt-4">
          <p className="mb-1 font-medium">Invite Link:</p>
          <input
            readOnly
            value={inviteLink}
            className="w-full p-2 border rounded bg-background"
          />
        </div>
      )}
    </div>
  );
}