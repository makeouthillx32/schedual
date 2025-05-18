
'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import EditRoleForm, { Role } from './EditRoleForm';
import ManageMembersTab from './ManageMembersTab';

interface RoleModalProps {
  title: string;
  role: Role | null;
  onClose: () => void;
  onSave: (role: Role) => void;
}

type TabType = 'edit' | 'members';

export default function RoleModal({ title, role, onClose, onSave }: RoleModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('edit');

  const handleSubmit = (formData: Role) => {
    onSave(formData);
  };

  // Handler for removing a member from the role
  const handleRemoveMember = async (userId: string) => {
    if (!role?.id) return;
    
    try {
      const response = await fetch('/api/profile/specializations/remove-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId: role.id, userId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove member');
      }
      
      // The ManageMembersTab component will refresh its own data
    } catch (error) {
      console.error('Error removing member:', error);
      // You might want to add error handling UI here
    }
  };

  // Handler for the "Add Members" button click
  const handleAddMembersClick = () => {
    // This could open another modal or expand a section
    // For now, we'll just log this action
    console.log('Add members clicked for role:', role?.id);
    // You could implement this functionality later
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'edit'
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
            onClick={() => setActiveTab('edit')}
          >
            Details
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'members'
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
            onClick={() => setActiveTab('members')}
            disabled={!role?.id}
          >
            Manage Members
          </button>
        </div>
        
        {/* Tab Content */}
        <div className="flex-1 overflow-auto">
          {activeTab === 'edit' ? (
            <EditRoleForm role={role} onSave={handleSubmit} />
          ) : (
            role && <ManageMembersTab 
              roleId={role.id || ''} 
              roleName={role.name || ''} 
              onRemoveMember={handleRemoveMember}
              onAddClick={handleAddMembersClick}
            />
          )}
        </div>
        
        {/* Footer */}
        {activeTab === 'edit' && (
          <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 mr-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="role-form"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {role ? 'Update Specialization' : 'Create Specialization'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}