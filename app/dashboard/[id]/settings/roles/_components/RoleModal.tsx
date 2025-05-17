import React, { useState, useEffect } from 'react';
import { X, Search, User, Users, AlertTriangle } from 'lucide-react';

// Role interface
interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  role_type: string;
}

// Member interface
interface RoleMember {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
}

// Props for the component
interface RoleManagementModalProps {
  role: Role | null;
  onClose: () => void;
  onSaveRole: (role: Role) => void;
  onRemoveMember: (userId: string) => Promise<void>;
  onAddMembers: (userIds: string[]) => Promise<void>;
}

// Default colors for role selection
const DEFAULT_COLORS = [
  '#10b981', // emerald
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f59e0b', // amber
  '#ef4444', // red
  '#6366f1', // indigo
  '#14b8a6', // teal
  '#f97316', // orange
  '#84cc16', // lime
];

// Available role types
const ROLE_TYPES = ['admin', 'jobcoach', 'client', 'user'];

export default function RoleManagementModal({ 
  role, 
  onClose, 
  onSaveRole,
  onRemoveMember,
  onAddMembers
}: RoleManagementModalProps) {
  // Define tabs
  type TabType = 'edit' | 'members' | 'add';
  const [activeTab, setActiveTab] = useState<TabType>('edit');
  
  // Role form state
  const [formData, setFormData] = useState<Role>({
    id: role?.id || '',
    name: role?.name || '',
    description: role?.description || '',
    color: role?.color || DEFAULT_COLORS[0],
    role_type: role?.role_type || ROLE_TYPES[2], // default to 'client'
  });
  
  // Form validation errors
  const [errors, setErrors] = useState({
    name: '',
    role_type: '',
  });
  
  // Color selection state
  const [selectedColor, setSelectedColor] = useState(formData.color);
  const [customColor, setCustomColor] = useState(
    DEFAULT_COLORS.includes(formData.color) ? '' : formData.color
  );
  
  // Members management state
  const [members, setMembers] = useState<RoleMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableUsers, setAvailableUsers] = useState<RoleMember[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load members when component mounts or tab changes
  useEffect(() => {
    if (!role?.id || activeTab === 'edit') return;
    
    const fetchMembers = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/profile/specializations/get-members?id=${role.id}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch role members: ${res.status}`);
        }
        const data = await res.json();
        setMembers(data);
      } catch (err) {
        console.error('Error fetching role members:', err);
        setError('Failed to load role members. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [role?.id, activeTab]);

  // Handle search for users to add
  useEffect(() => {
    if (activeTab !== 'add' || !searchQuery.trim()) {
      setAvailableUsers([]);
      return;
    }

    const fetchAvailableUsers = async () => {
      try {
        const res = await fetch(`/api/get-all-users?search=${encodeURIComponent(searchQuery)}`);
        if (!res.ok) {
          throw new Error('Failed to search users');
        }
        
        const allUsers = await res.json();
        
        // Filter out users who are already members
        const memberIds = members.map(member => member.id);
        const filteredUsers = allUsers.filter(
          (user: any) => !memberIds.includes(user.id)
        );
        
        setAvailableUsers(filteredUsers.map((user: any) => ({
          id: user.id,
          name: user.display_name || user.email || 'Unknown User',
          email: user.email || '',
          avatar_url: user.avatar_url
        })));
      } catch (err) {
        console.error('Error searching users:', err);
        setError('Failed to search users. Please try again.');
      }
    };

    const debounceTimeout = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchAvailableUsers();
      }
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery, activeTab, members]);

  // Handle input changes for role form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle color selection
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setFormData(prev => ({
      ...prev,
      color
    }));
    setCustomColor('');
  };

  // Handle custom color input
  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    if (isValidHexColor(color)) {
      setSelectedColor(color);
      setFormData(prev => ({
        ...prev,
        color
      }));
    }
  };

  // Validate hex color format
  const isValidHexColor = (color: string) => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  };

  // Handle role form submission
  const handleSubmitRole = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    let isValid = true;
    const newErrors = { name: '', role_type: '' };
    
    if (!formData.name.trim()) {
      newErrors.name = 'Role name is required';
      isValid = false;
    }
    
    if (!formData.role_type) {
      newErrors.role_type = 'Role type is required';
      isValid = false;
    }
    
    setErrors(newErrors);
    
    if (isValid) {
      onSaveRole(formData);
      setActiveTab('members');
    }
  };

  // Handle user selection for adding to role
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Handle adding selected users to role
  const handleAddSelected = async () => {
    if (selectedUsers.length === 0) return;
    
    try {
      await onAddMembers(selectedUsers);
      
      // Fetch updated member list
      const res = await fetch(`/api/profile/specializations/get-members?id=${role?.id}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch updated role members: ${res.status}`);
      }
      const updatedMembers = await res.json();
      setMembers(updatedMembers);
      
      // Reset selection and go back to members tab
      setSelectedUsers([]);
      setSearchQuery('');
      setActiveTab('members');
    } catch (err) {
      console.error('Error adding members:', err);
      setError('Failed to add members. Please try again.');
    }
  };

  // Handle closing modal with ESC key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  // Filter members based on search query
  const filteredMembers = members.filter(member => 
    searchQuery === '' || 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {role ? `Edit Role: ${role.name}` : 'Create New Role'}
          </h2>
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
            className={`px-4 py-3 font-medium ${activeTab === 'edit' 
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
            onClick={() => setActiveTab('edit')}
          >
            Edit Role
          </button>
          <button
            className={`px-4 py-3 font-medium ${activeTab === 'members' 
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
            onClick={() => role && role.id ? setActiveTab('members') : null}
            disabled={!role || !role.id}
          >
            Manage Members
          </button>
          <button
            className={`px-4 py-3 font-medium ${activeTab === 'add' 
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
            onClick={() => role && role.id ? setActiveTab('add') : null}
            disabled={!role || !role.id}
          >
            Add Members
          </button>
        </div>
        
        {/* Tab content */}
        <div className="flex-1 overflow-hidden">
          {/* Edit Role Tab */}
          {activeTab === 'edit' && (
            <div className="h-full flex flex-col">
              <form className="p-4 overflow-y-auto flex-1">
                {/* Role Name */}
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Role Name*
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                    placeholder="Enter role name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                  )}
                </div>
                
                {/* Role Type */}
                <div className="mb-4">
                  <label htmlFor="role_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Role Type*
                  </label>
                  <select
                    id="role_type"
                    name="role_type"
                    value={formData.role_type}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${errors.role_type ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  >
                    <option value="">Select a role type</option>
                    {ROLE_TYPES.map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                  {errors.role_type && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.role_type}</p>
                  )}
                </div>
                
                {/* Role Description */}
                <div className="mb-4">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter role description (optional)"
                  />
                </div>
                
                {/* Role Color */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role Color
                  </label>
                  <div className="grid grid-cols-5 gap-2 mb-3">
                    {DEFAULT_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`w-full h-8 rounded-md border-2 ${selectedColor === color ? 'border-blue-500 dark:border-blue-400' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                        onClick={() => handleColorSelect(color)}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customColor}
                      onChange={handleCustomColorChange}
                      placeholder="#HEX color"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    {customColor && (
                      <div 
                        className={`w-8 h-8 rounded-md border ${isValidHexColor(customColor) ? 'border-transparent' : 'border-red-500'}`}
                        style={{ backgroundColor: isValidHexColor(customColor) ? customColor : '#ffffff' }}
                      />
                    )}
                  </div>
                  {customColor && !isValidHexColor(customColor) && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      Please enter a valid hex color (e.g., #FF5500)
                    </p>
                  )}
                </div>
              </form>
              
              <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 mr-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitRole}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  {role ? 'Update Role' : 'Create Role'}
                </button>
              </div>
            </div>
          )}
          
          {/* Manage Members Tab */}
          {activeTab === 'members' && (
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
              
              {/* Members list */}
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                  </div>
                ) : error ? (
                  <div className="p-4 text-red-500 dark:text-red-400">
                    <div className="flex items-start">
                      <AlertTriangle className="mr-2 flex-shrink-0" size={18} />
                      <p>{error}</p>
                    </div>
                  </div>
                ) : filteredMembers.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                    <Users size={48} className="mx-auto mb-4 opacity-30" />
                    <p>No members assigned to this role.</p>
                    <button 
                      onClick={() => setActiveTab('add')}
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
                          onClick={() => onRemoveMember(member.id)}
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
                  {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''} in this role
                </div>
                <button
                  onClick={() => setActiveTab('add')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  Add Members
                </button>
              </div>
            </div>
          )}
          
          {/* Add Members Tab */}
          {activeTab === 'add' && (
            <div className="h-full flex flex-col">
              {/* Search */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="text"
                    placeholder="Search users to add..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              {/* Available users list */}
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                  </div>
                ) : error ? (
                  <div className="p-4 text-red-500 dark:text-red-400">
                    <div className="flex items-start">
                      <AlertTriangle className="mr-2 flex-shrink-0" size={18} />
                      <p>{error}</p>
                    </div>
                  </div>
                ) : searchQuery && availableUsers.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                    <Users size={48} className="mx-auto mb-4 opacity-30" />
                    <p>No users found matching your search.</p>
                  </div>
                ) : !searchQuery ? (
                  <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                    <Search size={48} className="mx-auto mb-4 opacity-30" />
                    <p>Type to search for users to add to this role.</p>
                  </div>
                ) : (
                  <div>
                    {availableUsers.map(user => (
                      <div 
                        key={user.id} 
                        className={`flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${
                          selectedUsers.includes(user.id) ? 'bg-blue-50 dark:bg-blue-900 dark:bg-opacity-25' : ''
                        }`}
                        onClick={() => toggleUserSelection(user.id)}
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden mr-3">
                            {user.avatar_url ? (
                              <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              <User size={20} className="text-gray-500 dark:text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded border ${
                          selectedUsers.includes(user.id)
                            ? 'bg-blue-500 border-blue-500'
                            : 'border-gray-300 dark:border-gray-500'
                        } flex items-center justify-center`}>
                          {selectedUsers.includes(user.id) && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setActiveTab('members')}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddSelected}
                    disabled={selectedUsers.length === 0}
                    className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white ${
                      selectedUsers.length > 0
                        ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                        : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                    }`}
                  >
                    Add to Role
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}