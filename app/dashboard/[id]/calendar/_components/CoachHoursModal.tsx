// app/dashboard/[id]/calendar/_components/CoachHoursModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock, Save, MapPin, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface CoachHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (hoursData: CoachHoursData) => void;
  selectedDate: Date | null;
  coachName: string;
}

interface CoachHoursData {
  report_date: string;
  hours_worked: number;
  location?: string;
  activity_type?: string;
  notes?: string;
}

const ACTIVITY_TYPES = [
  'Client Coaching',
  'Group Session',
  'Job Search Support',
  'Skills Training',
  'Administrative',
  'Community Outreach',
  'Professional Development',
  'Other'
];

const COMMON_LOCATIONS = [
  'Main Office',
  'Community Center',
  'Client Home',
  'Library',
  'Job Fair',
  'Employer Site',
  'Virtual/Remote',
  'Other'
];

export default function CoachHoursModal({
  isOpen,
  onClose,
  onSubmit,
  selectedDate,
  coachName
}: CoachHoursModalProps) {
  const [formData, setFormData] = useState<CoachHoursData>({
    report_date: '',
    hours_worked: 0,
    location: '',
    activity_type: 'Client Coaching',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when selected date changes
  useEffect(() => {
    if (selectedDate && isOpen) {
      setFormData(prev => ({
        ...prev,
        report_date: format(selectedDate, 'yyyy-MM-dd')
      }));
    }
  }, [selectedDate, isOpen]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setIsSubmitting(false);
    } else {
      // Reset form when closing
      setFormData({
        report_date: '',
        hours_worked: 0,
        location: '',
        activity_type: 'Client Coaching',
        notes: ''
      });
    }
  }, [isOpen]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'hours_worked' ? parseFloat(value) || 0 : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Quick hour buttons for common entries
  const handleQuickHours = (hours: number) => {
    setFormData(prev => ({
      ...prev,
      hours_worked: hours
    }));
    
    if (errors.hours_worked) {
      setErrors(prev => ({
        ...prev,
        hours_worked: ''
      }));
    }
  };

  // Parse "TB 7" style input
  const handleQuickEntry = (entry: string) => {
    // Parse formats like "TB 7", "JS 4.5", "AC 8"
    const match = entry.match(/^([A-Z]{1,3})\s+(\d+(?:\.\d+)?)$/i);
    if (match) {
      const initials = match[1].toUpperCase();
      const hours = parseFloat(match[2]);
      
      setFormData(prev => ({
        ...prev,
        hours_worked: hours,
        notes: `${initials} - ${hours} hours worked`
      }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.report_date) {
      newErrors.report_date = 'Date is required';
    }

    if (!formData.hours_worked || formData.hours_worked <= 0) {
      newErrors.hours_worked = 'Hours worked must be greater than 0';
    }

    if (formData.hours_worked > 24) {
      newErrors.hours_worked = 'Hours worked cannot exceed 24 hours';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting coach hours:', error);
      setErrors({ submit: 'Failed to log hours. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date for display
  const formatDisplayDate = (date: Date | null) => {
    if (!date) return 'No date selected';
    return format(date, 'EEEE, MMMM d, yyyy');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md bg-[hsl(var(--card))] rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[hsl(var(--border))]">
          <div>
            <h2 className="text-lg font-semibold text-[hsl(var(--card-foreground))]">
              Log Work Hours
            </h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {formatDisplayDate(selectedDate)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[hsl(var(--muted))] rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Coach Info */}
          <div className="p-3 bg-[hsl(var(--muted))] rounded-lg">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[hsl(var(--muted-foreground))]" />
              <span className="text-sm font-medium">Coach: {coachName}</span>
            </div>
          </div>

          {/* Quick Entry */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Quick Entry (e.g., "TB 7" for 7 hours)
            </label>
            <input
              type="text"
              placeholder="Enter initials and hours (e.g., TB 7)"
              className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent"
              onBlur={(e) => {
                if (e.target.value.trim()) {
                  handleQuickEntry(e.target.value.trim());
                  e.target.value = ''; // Clear the input
                }
              }}
            />
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
              Format: Initials + Space + Hours (e.g., "TB 7", "JS 4.5")
            </p>
          </div>

          {/* Date */}
          <div>
            <label htmlFor="report_date" className="block text-sm font-medium mb-2">
              Date *
            </label>
            <input
              type="date"
              id="report_date"
              name="report_date"
              value={formData.report_date}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent ${
                errors.report_date ? 'border-red-500' : 'border-[hsl(var(--border))]'
              }`}
              disabled={isSubmitting}
              required
            />
            {errors.report_date && (
              <p className="text-red-500 text-xs mt-1">{errors.report_date}</p>
            )}
          </div>

          {/* Hours Worked */}
          <div>
            <label htmlFor="hours_worked" className="block text-sm font-medium mb-2">
              Hours Worked *
            </label>
            <div className="space-y-2">
              <input
                type="number"
                id="hours_worked"
                name="hours_worked"
                value={formData.hours_worked || ''}
                onChange={handleInputChange}
                step="0.25"
                min="0"
                max="24"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent ${
                  errors.hours_worked ? 'border-red-500' : 'border-[hsl(var(--border))]'
                }`}
                disabled={isSubmitting}
                required
              />
              
              {/* Quick Hour Buttons */}
              <div className="flex flex-wrap gap-2">
                {[1, 2, 4, 6, 7, 8].map(hours => (
                  <button
                    key={hours}
                    type="button"
                    onClick={() => handleQuickHours(hours)}
                    className="px-3 py-1 text-xs bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary))]/80 rounded-md transition-colors"
                    disabled={isSubmitting}
                  >
                    {hours}h
                  </button>
                ))}
              </div>
            </div>
            {errors.hours_worked && (
              <p className="text-red-500 text-xs mt-1">{errors.hours_worked}</p>
            )}
          </div>

          {/* Activity Type */}
          <div>
            <label htmlFor="activity_type" className="block text-sm font-medium mb-2">
              Activity Type
            </label>
            <select
              id="activity_type"
              name="activity_type"
              value={formData.activity_type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent"
              disabled={isSubmitting}
            >
              {ACTIVITY_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium mb-2">
              <MapPin size={16} className="inline mr-1" />
              Location
            </label>
            <div className="space-y-2">
              <select
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent"
                disabled={isSubmitting}
              >
                <option value="">Select location...</option>
                {COMMON_LOCATIONS.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
              
              {/* Custom location input if "Other" is selected */}
              {formData.location === 'Other' && (
                <input
                  type="text"
                  placeholder="Enter custom location"
                  className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent"
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  disabled={isSubmitting}
                />
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium mb-2">
              <FileText size={16} className="inline mr-1" />
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Additional notes for KRC reporting..."
              className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-[hsl(var(--border))] rounded-md hover:bg-[hsl(var(--muted))] transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-md hover:bg-[hsl(var(--primary))]/90 transition-colors flex items-center justify-center gap-2"
              disabled={isSubmitting || !formData.hours_worked}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Log Hours
                </>
              )}
            </button>
          </div>
        </form>

        {/* KRC Info Footer */}
        <div className="px-6 pb-6">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-700 text-xs">
              <strong>For KRC Reporting:</strong> This information will be included in monthly reports. 
              Please ensure accuracy for compliance purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}