'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import RoleModal from './_components/RoleModal';
import DeleteConfirmModal from './_components/DeleteConfirmModal';
import './_components/roles.scss';
import { toast } from 'react-hot-toast';

// Define types for role/specialization data
interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  role_type: string;
  member_count?: number;
}

export default function RolesManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);

  // Fetch roles on component mount
  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/profile/specializations/get-all');
      if (!res.ok) {
        throw new Error(`Failed to fetch roles: ${res.status}`);
      }
      const data = await res.json();
      
      // Transform data to match our expected format
      const transformedData = data.map((role: any) => ({
        id: role.id,
        name: role.name,
        description: role.description || '',
        color: role.color || '#94a3b8',
        role_type: role.role || 'Unassigned',
        member_count: role.member_count || 0
      }));
      
      setRoles(transformedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError('Failed to load roles. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Filter roles based on search query
  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.role_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handler for opening the create role modal
  const handleCreateRole = () => {
    setCurrentRole(null);
    setIsCreateModalOpen(true);
  };

  // Handler for opening the edit role modal
  const handleEditRole = (role: Role) => {
    setCurrentRole(role);
    setIsEditModalOpen(true);
  };

  // Handler for opening the delete role modal
  const handleDeleteRole = (role: Role) => {
    setCurrentRole(role);
    setIsDeleteModalOpen(true);
  };

  // Handler for saving a new or edited role
  const handleSaveRole = async (updatedRole: Role) => {
    setIsLoading(true);
    try {
      // Determine if we're creating or updating
      const isCreating = !updatedRole.id;
      const endpoint = isCreating 
        ? '/api/profile/specializations/create' 
        : '/api/profile/specializations/update';
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedRole)
      });
      
      const responseData = await res.json();
      
      if (!res.ok) {
        throw new Error(responseData.error || `Failed to ${isCreating ? 'create' : 'update'} role: ${res.status}`);
      }
      
      // Update the local state
      if (isCreating) {
        setRoles(prevRoles => [...prevRoles, responseData]);
        toast.success(`Role "${responseData.name}" created successfully!`);
      } else {
        setRoles(prevRoles => 
          prevRoles.map(role => role.id === responseData.id ? responseData : role)
        );
        toast.success(`Role "${responseData.name}" updated successfully!`);
      }
      
      // Close the modal
      setIsCreateModalOpen(false);
      setIsEditModalOpen(false);
      
    } catch (err: any) {
      console.error(`Error ${currentRole ? 'updating' : 'creating'} role:`, err);
      setError(err.message || `Failed to ${currentRole ? 'update' : 'create'} role. Please try again.`);
      toast.error(err.message || `Failed to ${currentRole ? 'update' : 'create'} role`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for deleting a role
  const handleConfirmDelete = async () => {
    if (!currentRole) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/profile/specializations/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: currentRole.id })
      });
      
      const responseData = await res.json();
      
      if (!res.ok) {
        throw new Error(responseData.error || `Failed to delete role: ${res.status}`);
      }
      
      // Update local state
      setRoles(prevRoles => prevRoles.filter(role => role.id !== currentRole.id));
      setIsDeleteModalOpen(false);
      toast.success(`Role "${currentRole.name}" deleted successfully!`);
      
    } catch (err: any) {
      console.error('Error deleting role:', err);
      setError(err.message || 'Failed to delete role. Please try again.');
      toast.error(err.message || 'Failed to delete role');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to get the role type badge class
  const getRoleTypeBadgeClass = (roleType: string) => {
    switch (roleType.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'jobcoach':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'client':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'user':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  // Handle error dismiss
  const handleDismissError = () => {
    setError(null);
  };

  return (
    <ShowcaseSection title="Role & Specialization Management">
      <div className="roles-management">
        {/* Header with search and create button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="search-input flex-grow relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700"
            />
          </div>
          <button 
            onClick={handleCreateRole}
            className="create-role-btn flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} className="mr-2" />
            Create Role
          </button>
        </div>

        {/* Status indicators */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading roles...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 p-4 rounded-lg mb-6 flex items-start justify-between">
            <p>{error}</p>
            <button 
              onClick={handleDismissError}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 ml-4"
            >
              <XCircle size={20} />
            </button>
          </div>
        )}

        {/* Roles table */}
        {!isLoading && !error && (
          <>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="grid grid-cols-12 p-4 bg-gray-50 dark:bg-gray-900 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                <div className="col-span-3 md:col-span-2">Color</div>
                <div className="col-span-5 md:col-span-3">Name</div>
                <div className="hidden md:block md:col-span-2">Type</div>
                <div className="hidden md:block md:col-span-3">Description</div>
                <div className="col-span-2 md:col-span-1 text-center">Members</div>
                <div className="col-span-2 md:col-span-1 text-center">Actions</div>
              </div>

              {filteredRoles.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  {searchQuery ? 'No roles match your search.' : 'No roles found.'}
                </div>
              ) : (
                filteredRoles.map((role) => (
                  <div 
                    key={role.id} 
                    className="role-item grid grid-cols-12 p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                  >
                    <div className="col-span-3 md:col-span-2 flex items-center">
                      <div 
                        className="role-color w-6 h-6 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: role.color }}
                      />
                      <span className="ml-2 font-medium text-xs text-gray-500 dark:text-gray-400 hidden md:block">
                        {role.color}
                      </span>
                    </div>
                    <div className="col-span-5 md:col-span-3 flex items-center">
                      <span className="font-medium text-gray-900 dark:text-white truncate">
                        {role.name}
                      </span>
                    </div>
                    <div className="hidden md:flex md:col-span-2 items-center">
                      <span className={`px-2 py-1 text-xs rounded-full ${getRoleTypeBadgeClass(role.role_type)}`}>
                        {role.role_type}
                      </span>
                    </div>
                    <div className="hidden md:block md:col-span-3 text-gray-500 dark:text-gray-400 truncate">
                      {role.description || 'No description available'}
                    </div>
                    <div className="col-span-2 md:col-span-1 flex items-center justify-center">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs rounded-full">
                        {role.member_count || 0}
                      </span>
                    </div>
                    <div className="col-span-2 md:col-span-1 flex items-center justify-center space-x-2">
                      <button 
                        onClick={() => handleEditRole(role)}
                        className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Edit role"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteRole(role)}
                        className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete role"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              Showing {filteredRoles.length} of {roles.length} roles
            </div>
          </>
        )}
      </div>

      {/* Create Role Modal */}
      {isCreateModalOpen && (
        <RoleModal
          title="Create New Role"
          role={null}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleSaveRole}
        />
      )}

      {/* Edit Role Modal */}
      {isEditModalOpen && currentRole && (
        <RoleModal
          title={`Edit Role: ${currentRole.name}`}
          role={currentRole}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveRole}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && currentRole && (
        <DeleteConfirmModal
          title="Delete Role"
          message={`Are you sure you want to delete the role "${currentRole.name}"? This action cannot be undone.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setIsDeleteModalOpen(false)}
        />
      )}
    </ShowcaseSection>
  );
}



