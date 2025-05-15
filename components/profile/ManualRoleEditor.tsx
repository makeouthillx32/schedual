"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

export default function ManualRoleEditor() {
  const [uuid, setUuid] = useState("");
  const [role, setRole] = useState("client");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  
  const [allSpecializations, setAllSpecializations] = useState([]);
  const [userSpecializations, setUserSpecializations] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [availableSpecializations, setAvailableSpecializations] = useState([]);

  useEffect(() => {
    fetch("/api/get-all-users")
      .then((res) => res.json())
      .then(setUsers);
  }, []);

  useEffect(() => {
    fetch("/api/specializations/get-all")
      .then((res) => res.json())
      .then(setAllSpecializations);
  }, []);

  useEffect(() => {
    if (uuid) {
      fetchUserSpecializations();
    } else {
      setUserSpecializations([]);
    }
  }, [uuid]);

  useEffect(() => {
    if (role && allSpecializations.length > 0) {
      const roleSpecializations = allSpecializations.filter(
        (spec) => spec.role === role
      );
      setAvailableSpecializations(roleSpecializations);
    }
  }, [role, allSpecializations]);

  const fetchUserSpecializations = async () => {
    try {
      const res = await fetch(`/api/specializations/get-user-specializations?userId=${uuid}`);
      if (res.ok) {
        const data = await res.json();
        setUserSpecializations(data);
      }
    } catch (error) {
      console.error("Failed to fetch user specializations:", error);
    }
  };

  const handleUserChange = async (selectedUuid) => {
    setUuid(selectedUuid);
    if (!selectedUuid) {
      setRole("client");
      setUserSpecializations([]);
      return;
    }

    const user = users.find((u) => u.id === selectedUuid);
    if (user?.role) {
      // Fetch readable role name from role ID
      const res = await fetch(`/api/profile/role-label?role_id=${user.role}`);
      const data = await res.json();
      if (res.ok && data.role) {
        setRole(data.role);
      } else {
        setRole("client");
      }
    }
  };

  const handleUpdateRole = async () => {
    if (!uuid || !role) return;
    setLoading(true);
    setMessage(null);

    const specIds = userSpecializations.map((spec) => spec.id);

    const res = await fetch("/api/profile/set-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uuid, role, specializations: specIds }),
    });

    const result = await res.json();
    if (res.ok) {
      setMessage(`✅ Role updated to '${role}' for user ${uuid}.`);
    } else {
      setMessage(`❌ ${result.error || "Failed to update role."}`);
    }

    setLoading(false);
  };

  const handleAddSpecialization = async () => {
    if (!uuid || !selectedSpecialization) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/specializations/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: uuid,
          specializationId: selectedSpecialization,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        const specName = allSpecializations.find(
          (spec) => spec.id === selectedSpecialization
        )?.name || selectedSpecialization;

        setMessage(`✅ Added specialization '${specName}' to user ${uuid}.`);
        await fetchUserSpecializations();
        setSelectedSpecialization("");
      } else {
        setMessage(`❌ ${result.error || "Failed to add specialization."}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSpecialization = async (specId) => {
    if (!uuid || !specId) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/specializations/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: uuid,
          specializationId: specId,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        const specName =
          userSpecializations.find((spec) => spec.id === specId)?.name || specId;
        setMessage(`✅ Removed specialization '${specName}' from user ${uuid}.`);
        await fetchUserSpecializations();
      } else {
        setMessage(`❌ ${result.error || "Failed to remove specialization."}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredAvailableSpecializations = availableSpecializations.filter(
    (avail) => !userSpecializations.some((userSpec) => userSpec.id === avail.id)
  );

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white dark:bg-zinc-800 p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-center">Manually Set User Role</h2>

      <Label htmlFor="user">Select User</Label>
      <select
        id="user"
        className="w-full mb-4 p-2 rounded border bg-white dark:bg-zinc-700 text-black dark:text-white"
        value={uuid}
        onChange={(e) => handleUserChange(e.target.value)}
      >
        <option value="">Select a user</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.display_name || user.email || user.id}
          </option>
        ))}
      </select>

      {uuid && (
        <>
          <Label htmlFor="role">Role</Label>
          <select
            id="role"
            className="w-full mb-4 p-2 rounded border bg-white dark:bg-zinc-700 text-black dark:text-white"
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setUserSpecializations([]);
            }}
          >
            <option value="admin">Admin</option>
            <option value="jobcoach">Job Coach</option>
            <option value="client">Client</option>
            <option value="user">User</option>
          </select>

          <Button onClick={handleUpdateRole} disabled={loading} className="w-full mb-6">
            {loading ? "Updating..." : "Update Role"}
          </Button>

          <div className="mt-6">
            <Label className="block mb-2">Current Specializations</Label>
            <div className="border p-2 rounded min-h-12 mb-4 bg-gray-50 dark:bg-zinc-700">
              {userSpecializations.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center">No specializations assigned</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {userSpecializations.map((spec) => (
                    <div
                      key={spec.id}
                      className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full px-3 py-1 text-sm flex items-center"
                    >
                      {spec.name}
                      <button
                        onClick={() => handleRemoveSpecialization(spec.id)}
                        className="ml-2 text-red-500 hover:text-red-700 dark:text-red-300 dark:hover:text-red-100"
                        disabled={loading}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <Label htmlFor="specialization" className="block mb-2">Add Specialization</Label>
            <div className="flex gap-2">
              <select
                id="specialization"
                className="flex-1 p-2 rounded border bg-white dark:bg-zinc-700 text-black dark:text-white"
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                disabled={filteredAvailableSpecializations.length === 0}
              >
                <option value="">Select a specialization</option>
                {filteredAvailableSpecializations.map((spec) => (
                  <option key={spec.id} value={spec.id}>
                    {spec.name}
                  </option>
                ))}
              </select>
              <Button
                onClick={handleAddSpecialization}
                disabled={loading || !selectedSpecialization}
              >
                Add
              </Button>
            </div>
            {filteredAvailableSpecializations.length === 0 && (
              <p className="text-amber-600 dark:text-amber-400 text-sm mt-1">
                No available specializations for this role or all already assigned
              </p>
            )}
          </div>
        </>
      )}

      {message && (
        <div
          className={`mt-4 p-2 rounded text-sm ${
            message.startsWith("✅")
              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
              : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}