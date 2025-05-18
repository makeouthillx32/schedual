import React, { useState, useEffect } from 'react';
import { Search, Users, AlertTriangle, X, User, Info } from 'lucide-react';

// Member interface
interface RoleMember {
  id: string;
  name: string;
  email: string;
  avatar_url?: string | null;
}

interface ManageMembersTabProps {
  roleId: string;
  roleName: string;
  onRemoveMember: (userId: string) => Promise<void>;
  onAddClick: () => void;
}

export default function ManageMembersTab({ 
  roleId, 
  roleName, 
  onRemoveMember, 
  onAddClick 
}: ManageMembersTabProps) {
  const [members, setMembers] = useState<RoleMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  // Load members when component mounts or roleId changes
  useEffect(() => {
    if (!roleId) {
      setIsLoading(false);
      setError("No role ID provided");
      return;
    }
    
    const fetchMembers = async () => {
      setIsLoading(true);
      setError(null);
      setDebugInfo(null);
      
      try {
        console.log(`Fetching members for roleId: ${roleId}`);
        
        const res = await fetch(`/api/profile/specializations/get-members?id=${roleId}`);
        const responseText = await res.text(); // Get raw text first for debugging
        
        // Always log the response for debugging
        console.log(`Raw API response: ${responseText}`);
        setDebugInfo(`Response: ${responseText}`);
        
        if (!res.ok) {
          throw new Error(`Failed to fetch role members: ${res.status}`);
        }
        
        let data;
        try {
          // Try to parse as JSON
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error("JSON parse error:", parseError);
          throw new Error("Invalid response format");
        }
        
        console.log("Members data received:", data);
        
        // Check if data is an array
        if (!Array.isArray(data)) {
          console.warn("API did not return an array:", data);
          
          // If it's an error object with a message, display it
          if (data && typeof data === 'object' && 'error' in data) {
            setError(`API error: ${data.error}`);
          } else {
            setError("Unexpected data format returned from API");
          }
          
          setMembers([]);
          return;
        }
        
        // Map and normalize the data
        const normalizedMembers = data.map(member => ({
          id: member.id || "",
          name: member.name || "Unknown User",
          email: member.email || "",
          avatar_url: member.avatar_url || null
        }));
        
        console.log("Normalized members:", normalizedMembers);
        setMembers(normalizedMembers);
      } catch (err) {
        console.error('Error fetching role members:', err);
        setError(`Failed to load role members: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setMembers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [roleId]);

  // Filter members based on search query
  const filteredMembers = members.filter(member => 
    searchQuery === '' || 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle member removal with error handling
  const handleRemoveMember = async (userId: string) => {
    try {
      await onRemoveMember(userId);
      // Update local state to reflect the removal
      setMembers(currentMembers => 
        currentMembers.filter(member => member.id !== userId)
      );
    } catch (err) {
      console.error('Error removing member:', err);
      setError(`Failed to remove member: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      {/* Debug info */}
      {debugInfo && process.env.NODE_ENV !== 'production' && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-900/30">
          <div className="flex items-start">
            <Info className="mr-2 flex-shrink-0 text-yellow-500" size={18} />
            <div className="text-xs font-mono text-yellow-800 dark:text-yellow-200 overflow-x-auto">
              <p>Debug info:</p>
              <pre>{debugInfo}</pre>
            </div>
          </div>
        </div>
      )}
      
      {/* Error display */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-900/30">
          <div className="flex items-start">
            <AlertTriangle className="mr-2 flex-shrink-0 text-red-500" size={18} />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}
      
      {/* Members list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            <Users size={48} className="mx-auto mb-4 opacity-30" />
            <p>{error ? 'Unable to load members' : 'No members assigned to this role.'}</p>
            <button 
              onClick={onAddClick}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Add Members
            </button>
          </div>
        ) : (
          <div>
            {filteredMembers.map(member => (
              <div key={member.id} className="flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-700">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden mr-3">
                    {member.avatar_url ? (
                      <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <User size={20} className="text-gray-500 dark:text-gray-400" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{member.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{member.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveMember(member.id)}
                  className="ml-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  title="Remove from role"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''} in {roleName}
        </div>
        <button
          onClick={onAddClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          Add Members
        </button>
      </div>
    </div>
  );
}