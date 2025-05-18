'use client';

import React, { useState, useEffect } from 'react';

export interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  role_type: string;
}

interface EditRoleFormProps {
  role: Role | null;
  onSave: (role: Role) => void;
}

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

const ROLE_TYPES = ['admin', 'jobcoach', 'client', 'user'];

export default function EditRoleForm({ role, onSave }: EditRoleFormProps) {
  // Initialize state with role data or default values
  const [formData, setFormData] = useState<Role>({
    id: role?.id || '',
    name: role?.name || '',
    description: role?.description || '',
    color: role?.color || DEFAULT_COLORS[0],
    role_type: role?.role_type || ROLE_TYPES[2], // default to 'client'
  });
  
  const [errors, setErrors] = useState({
    name: '',
    role_type: '',
  });
  
  const [selectedColor, setSelectedColor] = useState(formData.color);
  const [customColor, setCustomColor] = useState(
    DEFAULT_COLORS.includes(formData.color) ? '' : formData.color
  );

  // Update form when role prop changes
  useEffect(() => {
    if (role) {
      setFormData({
        id: role.id || '',
        name: role.name || '',
        description: role.description || '',
        color: role.color || DEFAULT_COLORS[0],
        role_type: role.role_type || ROLE_TYPES[2],
      });
      setSelectedColor(role.color || DEFAULT_COLORS[0]);
      setCustomColor(DEFAULT_COLORS.includes(role.color || '') ? '' : role.color || '');
    }
  }, [role]);

  // Handle input changes
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

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
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
      onSave(formData);
    }
  };

  return (
    <form id="role-form" onSubmit={handleSubmit} className="p-4 overflow-y-auto max-h-[calc(90vh-130px)]">
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
          placeholder="Enter Role name"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
        )}
      </div>
      
      {/* Role Type */}
      <div className="mb-4">
        <label htmlFor="role_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Associated Role Type*
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
            <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
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
          placeholder="Enter Role description (optional)"
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
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">Please enter a valid hex color (e.g., #FF5500)</p>
        )}
      </div>
    </form>
  );
}