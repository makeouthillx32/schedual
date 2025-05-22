// components/theme/_components/ThemeToggle.tsx
'use client';

import React from 'react';
import './theme.scss';
import AccessibilityIcon from '@/assets/logos/asesablity.svg';

interface ThemeToggleProps {
  onClick: () => void;
}

/**
 * ThemeToggle - The floating button that opens the accessibility overlay
 */
const ThemeToggle: React.FC<ThemeToggleProps> = ({ onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="theme-toggle"
      aria-label="Open accessibility and theme settings"
    >
      <AccessibilityIcon className="theme-toggle__icon" />
    </button>
  );
};

export default ThemeToggle;