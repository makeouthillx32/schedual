
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
  
  // New state for specializations
  const [allSpecializations, setAllSpecializations] = useState([]);
  const [userSpecializations, setUserSpecializations] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [availableSpecializations, setAvailableSpecializations] = useState([]);

  // Fetch all users
  useEffect(() => {
    const fetchAllUsers = async () => {
      const res = await fetch("/api/get-all-users");
      const data = await res.json();
      if (res.ok) setUsers(data);
    };
    fetchAllUsers();
  }, []);

  // Fetch all specializations
  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        const res = await fetch("/api/specializations/get-all");
        if (res.ok) {
          const data = await res.json();
          setAllSpecializations(data);
        }
      } catch (error) {
        console.error("Failed to fetch specializations:", error);
      }
    };
    fetchSpecializations();
  }, []);

  // Filter specializations by selected role
  useEffect(() => {
    if (role && allSpecializations.length > 0) {
      const roleSpecializations = allSpecializations.filter(spec => 
        spec.role_name === role
      );
      setAvailableSpecializations(roleSpecializations);
    }
  }, [role, allSpecializations]);

  // Fetch user's specializations when user is selected
  useEffect(() => {
    if (uuid) {
      fetchUserSpecializations();
    } else {
      setUserSpecializations([]);
    }
  }, [uuid]);

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

  const selectedUser = users.find((user) => user.id === uuid);

  // Update to handle user selection
  const handleUserChange = (selectedUuid) => {
    setUuid(selectedUuid);
    
    if (selectedUuid) {
      // Get the user's current role
      const user = users.find(u => u.id === selectedUuid);
      if (user && user.role) {
        setRole(user.role);
      }
    } else {
      setRole("client");
      setUserSpecializations([]);
    }
  };

  // Update the role update handler to include specializations
  const handleUpdateRole = async () => {
    if (!uuid || !role) return;
    setLoading(true);
    setMessage(null);

    // Get the current user specialization IDs
    const specIds = userSpecializations.map(spec => spec.id);

    const res = await fetch("/api/profile/set-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        uuid, 
        role,
        specializations: specIds 
      }),
    });

    const result = await res.json();
    if (res.ok) {
      setMessage(`✅ Role updated to '${role}' for user ${selectedUser?.display_name}.`);
    } else {
      setMessage(`❌ ${result.error || "Failed to update role."}`);
    }

    setLoading(false);
  };

  // Add specialization to user
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
          specializationId: selectedSpecialization 
        }),
      });

      const result = await res.json();
      if (res.ok) {
        // Get the specialization name for the message
        const specName = allSpecializations.find(
          spec => spec.id === selectedSpecialization
        )?.name || selectedSpecialization;
        
        setMessage(`✅ Added specialization '${specName}' to user ${selectedUser?.display_name}.`);
        
        // Refresh user specializations
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

  // Remove specialization from user
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
          specializationId: specId 
        }),
      });

      const result = await res.json();
      if (res.ok) {
        // Get the specialization name for the message
        const specName = userSpecializations.find(
          spec => spec.id === specId
        )?.name || specId;
        
        setMessage(`✅ Removed specialization '${specName}' from user ${selectedUser?.display_name}.`);
        
        // Refresh user specializations
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

  // Filter out specializations the user already has
  const filteredAvailableSpecializations = availableSpecializations.filter(
    avail => !userSpecializations.some(userSpec => userSpec.id === avail.id)
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
              // Reset specializations when role changes since they're role-specific
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

          {/* Current Specializations */}
          <div className="mt-6">
            <Label className="block mb-2">Current Specializations</Label>
            <div className="border p-2 rounded min-h-12 mb-4 bg-gray-50 dark:bg-zinc-700">
              {userSpecializations.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center">No specializations assigned</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {userSpecializations.map((spec) => (
                    <div key={spec.id} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full px-3 py-1 text-sm flex items-center">
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

          {/* Add Specialization */}
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
        <div className={`mt-4 p-2 rounded text-sm ${message.startsWith('✅') ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'}`}>
          {message}
        </div>
      )}
    </div>
  );
}

</antArtifact>


Now, you'll need to update your `/api/profile/set-role` endpoint to support specializations:
<antArtifact None>
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // Verify that caller has admin privileges
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session || !["admin"].includes(session.user.role)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { uuid, role, specializations = [] } = await request.json();

    if (!uuid || !role) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Get role ID from the role name
    const { data: roleData, error: roleError } = await supabase
      .from("roles")
      .select("id")
      .eq("role", role)
      .single();

    if (roleError) {
      return Response.json({ error: `Role error: ${roleError.message}` }, { status: 500 });
    }

    // 2. Update user's role in profiles table
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ role: roleData.id })
      .eq("id", uuid);

    if (updateError) {
      return Response.json({ error: `Update error: ${updateError.message}` }, { status: 500 });
    }

    // 3. Handle specialization updates
    
    // 3a. First, get existing user specializations
    const { data: existingSpecs, error: existingSpecsError } = await supabase
      .from("user_specializations")
      .select("specialization_id")
      .eq("user_id", uuid);

    if (existingSpecsError) {
      console.error("Error fetching existing specializations:", existingSpecsError);
      // Continue with the process - non-critical error
    }

    const existingSpecIds = (existingSpecs || []).map(spec => spec.specialization_id);
    
    // 3b. Determine which specializations to add/remove
    const specsToAdd = specializations.filter(id => !existingSpecIds.includes(id));
    const specsToRemove = existingSpecIds.filter(id => !specializations.includes(id));

    // 3c. Remove specializations that are no longer needed
    if (specsToRemove.length > 0) {
      const { error: removeError } = await supabase
        .from("user_specializations")
        .delete()
        .eq("user_id", uuid)
        .in("specialization_id", specsToRemove);

      if (removeError) {
        console.error("Error removing specializations:", removeError);
        // Continue with the process - non-critical error
      }
    }

    // 3d. Add new specializations
    if (specsToAdd.length > 0) {
      const specsToInsert = specsToAdd.map(specId => ({
        user_id: uuid,
        specialization_id: specId,
        assigned_by: session.user.id,
        assigned_at: new Date()
      }));

      const { error: addError } = await supabase
        .from("user_specializations")
        .insert(specsToInsert);

      if (addError) {
        console.error("Error adding specializations:", addError);
        // Continue with the process - non-critical error
      }
    }

    return Response.json({ 
      success: true,
      message: `Updated role to ${role} for user ${uuid}`,
      updated_specializations: {
        added: specsToAdd.length,
        removed: specsToRemove.length
      }
    });
  } catch (error) {
    console.error("Set role error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}