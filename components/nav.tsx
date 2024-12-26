"use client";

import React, { useEffect, useState } from "react";

interface NavProps {
  themeType: "dark" | "light";
  toggleTheme: () => void;
}

const Nav: React.FC<NavProps> = ({ themeType, toggleTheme }) => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px",
        background: themeType === "dark" ? "#1e1e1e" : "#f5f5f5",
        color: themeType === "dark" ? "#fff" : "#000",
      }}
    >
      <h1 style={{ margin: 0 }}>CMS Schedule App</h1>
      <div>
        <span style={{ marginRight: "20px" }}>
          {currentDateTime.toLocaleDateString()}{" "}
          {currentDateTime.toLocaleTimeString()}
        </span>
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
      </div>
    </nav>
  );
};

export default Nav;
