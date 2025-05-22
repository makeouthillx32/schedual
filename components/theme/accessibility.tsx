// components/theme/_components/ThemeToggle.tsx
'use client';

import React from 'react';
import './theme.scss';

interface ThemeToggleProps {
  onClick: () => void;
}

/**
 * ThemeToggle - The floating button that opens the accessibility & theme overlay
 */
const ThemeToggle: React.FC<ThemeToggleProps> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="theme-toggle"
    aria-label="Open accessibility and theme settings"
  >
    <img
      src="/images/icon/asesablity.svg"
      alt="Accessibility & theme settings"
      className="theme-toggle__icon"
    />
  </button>
);

export default ThemeToggle;