// app/dashboard/[id]/calendar/_components/CoachHoursModal.tsx
// Enhanced modal for flexible hour logging with quick entry support
'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock, Save, MapPin, FileText, Plus } from 'lucide-react';
import { format } from 'date-fns';

interface CoachHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (hoursData: CoachHoursData) => void;
  selectedDate: Date | null;
  coachName: string;
  existingHours?: number; // For showing already logged hours
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
  'Administrative Tasks',
  'Team Meeting',
  'Community Outreach',
  'Assessment',
  'Follow-up',
  'Documentation',
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
  'Field Office',
  'Other'
];

// Quick entry code mapping for coach initials (not activity types!)
const COACH_INITIALS_MAP: Record<string, string> = {
  'TB': 'Tyler Burnse',
  'SC': 'Shelia Clark', 
  'GC': 'Glen Clark',
  'JD': 'John Doe',
  'MS': 'Mary Smith',
  // Add more coach initials as needed
};

export default function CoachHoursModal({
  isOpen,
  onClose,
  onSubmit,
  selectedDate,
  coachName,
  existingHours = 0
}: CoachHoursModalProps) {
  const [formData, setFormData] = useState<CoachHoursData>({
    report_date: '',
    hours_worked: 0,
    location: 'Main Office',
    activity_type: 'Client Coaching',
    notes: ''
  });
  
  const [quickEntry, setQuickEntry] = useState('');
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
      setQuickEntry('');
    } else {
      // Reset form when closing
      setFormData({
        report_date: '',
        hours_worked: 0,
        location: 'Main Office',
        activity_type: 'Client Coaching',
        notes: ''
      });
      setQuickEntry('');
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

  // Parse "TB 7" style quick entry (coach initials + hours)
  const parseQuickEntry = (entry: string) => {
    const trimmed = entry.trim().toUpperCase();
    
    // Pattern: 1-3 letters followed by space and number
    const match = trimmed.match(/^([A-Z]{1,3})\s+(\d+(?:\.\d+)?)$/);
    
    if (!match) return null;
    
    const [, initials, hoursStr] = match;
    const hours = parseFloat(hoursStr);
    
    if (isNaN(hours) || hours <= 0 || hours > 12) return null;
    
    const coachName = COACH_INITIALS_MAP[initials];
    if (!coachName) return null;
    
    return {
      initials,
      hours,
      coachName,
      originalInput: entry
    };
  };

  // Handle quick entry input
  const handleQuickEntryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuickEntry(value);
    
    const parsed = parseQuickEntry(value);
    if (parsed) {
      setFormData(prev => ({
        ...prev,
        hours_worked: parsed.hours,
        notes: `${parsed.initials} - ${parsed.hours} hours worked by ${parsed.coachName}`
      }));
    }
  };

  // Apply quick entry
  const handleApplyQuickEntry = () => {
    const parsed = parseQuickEntry(quickEntry);
    if (parsed) {
      setFormData(prev => ({
        ...prev,
        hours_worked: parsed.hours,
        notes: `${parsed.initials} - ${parsed.hours} hours worked by ${parsed.coachName}`
      }));
      setQuickEntry('');
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

    if (formData.hours_worked > 12) {
      newErrors.hours_worked = 'Hours worked cannot exceed 12 hours per day';
    }

    if (!formData.activity_type) {
      newErrors.activity_type = 'Activity type is required';
    }

    if (!formData.location) {
      newErrors.location = 'Location is required';
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg bg-[hsl(var(--card))] shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))] p-6">
          <div>
            <h2 className="text-xl font-semibold text-[hsl(var(--card-foreground))]">
              Log Work Hours
            </h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
              {coachName} • {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select Date'}
            </p>
            {existingHours > 0 && (
              <p className="text-xs text-amber-600 mt-1">
                ⚠️ Already logged: {existingHours} hours today
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-[hsl(var(--muted))] transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Quick Entry */}
          <div className="bg-[hsl(var(--muted))] p-4 rounded-lg">
            <label className="block text-sm font-medium mb-2">
              Quick Entry (e.g., "TB 7", "SC 4.5", "GC 8")
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={quickEntry}
                onChange={handleQuickEntryChange}
                placeholder="TB 7 (Coach Initials + Hours)"
                className="flex-1 px-3 py-2 border border-[hsl(var(--border))] rounded-md focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={handleApplyQuickEntry}
                disabled={!parseQuickEntry(quickEntry) || isSubmitting}
                className="px-3 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-md hover:bg-[hsl(var(--primary))]/90 transition-colors disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            
            {/* Coach Initials Reference */}
            <div className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
              <details>
                <summary className="cursor-pointer">Coach Initials</summary>
                <div className="mt-1 grid grid-cols-2 gap-1">
                  {Object.entries(COACH_INITIALS_MAP).map(([initials, name]) => (
                    <div key={initials} className="flex gap-1">
                      <span className="font-mono font-bold">{initials}:</span>
                      <span>{name}</span>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          </div>

          {/* Date */}
          <div>
            <label htmlFor="report_date" className="block text-sm font-medium mb-2">
              <Clock className="inline h-4 w-4 mr-1" />
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
              Hours Worked * (1-12 hours)
            </label>
            <div className="space-y-3">
              <input
                type="number"
                id="hours_worked"
                name="hours_worked"
                value={formData.hours_worked || ''}
                onChange={handleInputChange}
                step="0.25"
                min="0.25"
                max="12"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent ${
                  errors.hours_worked ? 'border-red-500' : 'border-[hsl(var(--border))]'
                }`}
                disabled={isSubmitting}
                required
              />
              
              {/* Quick Hour Buttons */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-[hsl(var(--muted-foreground))] mr-2">Quick:</span>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(hours => (
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
                {[1.5, 2.5, 4.5, 6.5].map(hours => (
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
              Activity Type *
            </label>
            <select
              id="activity_type"
              name="activity_type"
              value={formData.activity_type}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent ${
                errors.activity_type ? 'border-red-500' : 'border-[hsl(var(--border))]'
              }`}
              disabled={isSubmitting}
              required
            >
              {ACTIVITY_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.activity_type && (
              <p className="text-red-500 text-xs mt-1">{errors.activity_type}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium mb-2">
              <MapPin className="inline h-4 w-4 mr-1" />
              Location *
            </label>
            <select
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent ${
                errors.location ? 'border-red-500' : 'border-[hsl(var(--border))]'
              }`}
              disabled={isSubmitting}
              required
            >
              {COMMON_LOCATIONS.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
            {errors.location && (
              <p className="text-red-500 text-xs mt-1">{errors.location}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium mb-2">
              <FileText className="inline h-4 w-4 mr-1" />
              Notes (Optional)
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
                  <Save className="h-4 w-4" />
                  Log {formData.hours_worked || 0} Hours
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