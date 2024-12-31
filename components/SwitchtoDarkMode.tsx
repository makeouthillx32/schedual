"use client";

import React, { useEffect, useState } from "react";

const SwitchtoDarkMode: React.FC = () => {
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    const hours = new Date().getHours();
    const isDaytime = hours > 7 && hours < 20;
    setIsChecked(isDaytime);

    // Apply the correct theme on component mount
    document.documentElement.classList.toggle("dark", !isDaytime);
  }, []);

  const handleToggle = () => {
    document.documentElement.classList.toggle("dark", !isChecked);
    setIsChecked(!isChecked);
  };

  return (
    <div className="flex items-center space-x-2">
      <input
        id="toggle"
        className="toggle"
        type="checkbox"
        checked={isChecked}
        onChange={handleToggle}
      />
      <label htmlFor="toggle" className="title">
        Toggle dark mode
      </label>
    </div>
  );
};

export default SwitchtoDarkMode;
