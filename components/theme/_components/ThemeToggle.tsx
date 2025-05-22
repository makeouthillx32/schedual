'use client';

import React from 'react';
import './theme.scss';

interface ThemeToggleProps {
  onClick: () => void;
}

/**
 * ThemeToggle - The floating button that opens the theme selector overlay
 */
const ThemeToggle: React.FC<ThemeToggleProps> = ({ onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="theme-toggle"
      aria-label="Open accessibility and theme settings"
    >
      <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"></path>
        <path d="M12 7V9"></path>
        <path d="M12 15v2"></path>
        <path d="M9 12H7"></path>
        <path d="M17 12h-2"></path>
        <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>
      </svg>
    </button>
  );
};

export default ThemeToggle;