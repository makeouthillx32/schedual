// "use client";

// import { useRouter } from "next/navigation";
// import { useState } from "react";

// export default function DeleteAccount() {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);

//   const handleDelete = async () => {
//     const confirm = window.confirm("Are you sure you want to permanently delete your account?");
//     if (!confirm) return;

//     setLoading(true);
//     const res = await fetch("/api/delete-account", { method: "DELETE" });

//     if (res.ok) {
//       router.push("/sign-in");
//     } else {
//       alert("Failed to delete account. Try again.");
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="w-full mt-8 text-center">
//       <button
//         onClick={handleDelete}
//         className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
//         disabled={loading}
//       >
//         {loading ? "Deleting..." : "Delete My Account"}
//       </button>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminUserManager() {
  const [users, setUsers] = useState<any[]>([]);
  const [uuid, setUuid] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllUsers = async () => {
      const res = await fetch("/api/get-all-users");
      const data = await res.json();
      if (res.ok) setUsers(data);
    };
    fetchAllUsers();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setMessage(null);
    setProfile(null);
    const res = await fetch(`/api/get-profile-by-id?id=${uuid}`);
    const data = await res.json();

    if (res.ok) {
      setProfile(data);
    } else {
      setMessage("Profile not found or error fetching data.");
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    const confirm = window.confirm("Delete user and all associated records permanently?");
    if (!confirm) return;

    setLoading(true);
    const res = await fetch("/api/admin-delete-user", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uuid }),
    });

    if (res.ok) {
      setMessage("✅ Successfully deleted user and all related records.");
      setProfile(null);
      setUuid("");
    } else {
      setMessage("❌ Deletion failed.");
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-10 p-6 bg-white dark:bg-gray-900 shadow rounded-md">
      <h2 className="text-xl font-bold mb-4 text-center">Admin: Delete User</h2>

      <select
        className="w-full p-2 mb-4 border rounded"
        value={uuid}
        onChange={(e) => setUuid(e.target.value)}
      >
        <option value="">Select user...</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.email || u.id}
          </option>
        ))}
      </select>

      <Button onClick={fetchProfile} disabled={loading || !uuid} className="mb-4 w-full">
        {loading ? "Fetching..." : "Fetch User"}
      </Button>

      {profile && (
        <div className="mb-4 border p-4 rounded bg-gray-100 dark:bg-zinc-800">
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Role:</strong> {profile.role || "N/A"}</p>
          <p><strong>Created:</strong> {new Date(profile.created_at).toLocaleString()}</p>
        </div>
      )}

      {profile && (
        <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 w-full">
          {loading ? "Deleting..." : "Delete User"}
        </Button>
      )}

      {message && <p className="text-center mt-4 text-sm">{message}</p>}
    </div>
  );
}
