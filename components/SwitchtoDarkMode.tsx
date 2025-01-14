"use client";

import React from "react";

interface SwitchtoDarkModeProps {
  toggleTheme: () => void; // Define the toggleTheme prop
}

const SwitchtoDarkMode: React.FC<SwitchtoDarkModeProps> = ({ toggleTheme }) => {
  return (
    <div className="flex items-center">
      <input
        id="toggle"
        className="toggle"
        type="checkbox"
        onChange={toggleTheme} // Trigger the theme toggle function
      />
    </div>
  );
};

export default SwitchtoDarkMode;