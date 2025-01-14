"use client";

import React from "react";

interface SwitchtoDarkModeProps {
  toggleTheme: () => void;
}

const SwitchtoDarkMode: React.FC<SwitchtoDarkModeProps> = ({ toggleTheme }) => {
  return (
    <div className="flex items-center">
      <input
        id="toggle"
        className="toggle"
        type="checkbox"
        onChange={toggleTheme}
      />
    </div>
  );
};

export default SwitchtoDarkMode;