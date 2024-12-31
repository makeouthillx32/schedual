"use client";

import React from "react";

interface SwitchToDarkModeProps {
  themeType: "dark" | "light";
  toggleTheme: () => void;
}

const SwitchToDarkMode: React.FC<SwitchToDarkModeProps> = ({
  themeType,
  toggleTheme,
}) => {
  return (
    <button
      onClick={toggleTheme}
      style={{
        padding: "5px 10px",
        borderRadius: "5px",
        background: themeType === "dark" ? "#333" : "#ddd",
        color: themeType === "dark" ? "#fff" : "#000",
        border: "none",
        cursor: "pointer",
      }}
    >
      {themeType === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
    </button>
  );
};

export default SwitchToDarkMode;
