"use client";

import React, { useEffect, useState } from "react";

interface SwitchToDarkModeProps {
  themeType: "dark" | "light";
  toggleTheme: () => void;
}

const SwitchToDarkMode: React.FC<SwitchToDarkModeProps> = ({
  themeType,
  toggleTheme,
}) => {
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    setIsChecked(themeType === "dark");
  }, [themeType]);

  return (
    <div className="relative flex items-center justify-center">
      <input
        id="toggle"
        className="toggle"
        type="checkbox"
        checked={isChecked}
        onChange={() => {
          setIsChecked((prev) => !prev);
          toggleTheme();
        }}
      />
      <div className="background"></div>
      <label htmlFor="toggle" className="title">
        Toggle dark mode
      </label>
    </div>
  );
};

export default SwitchToDarkMode;
