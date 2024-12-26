"use client";

import React, { useEffect, useState } from "react";

interface NavProps {
  themeType: "dark" | "light";
  toggleTheme: () => void;
  day: string;
  week: number;
  onDayChange: (newDay: string, newWeek: number) => void;
}

const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

const Nav: React.FC<NavProps> = ({ themeType, toggleTheme, day, week, onDayChange }) => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleDayChange = (direction: "previous" | "next") => {
    const currentDayIndex = daysOfWeek.indexOf(day.toLowerCase());
    let newDayIndex = currentDayIndex;
    let newWeek = week;

    if (direction === "previous") {
      newDayIndex = currentDayIndex === 0 ? 6 : currentDayIndex - 1;
      if (currentDayIndex === 0) newWeek = week - 1; // Go to the previous week if wrapping around
    } else if (direction === "next") {
      newDayIndex = currentDayIndex === 6 ? 0 : currentDayIndex + 1;
      if (currentDayIndex === 6) newWeek = week + 1; // Go to the next week if wrapping around
    }

    const newDay = daysOfWeek[newDayIndex];
    onDayChange(newDay, newWeek);
  };

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
      {/* Left Arrow for Previous Day */}
      <button
        onClick={() => handleDayChange("previous")}
        style={{
          padding: "5px 10px",
          borderRadius: "50%",
          background: themeType === "dark" ? "#333" : "#ddd",
          color: themeType === "dark" ? "#fff" : "#000",
          border: "none",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        &#8592;
      </button>

      {/* Center Content */}
      <div style={{ textAlign: "center" }}>
        <h1 style={{ margin: 0 }}>Cleaning Schedule App</h1>
        <p>
          Week {week} - {day.charAt(0).toUpperCase() + day.slice(1)}
        </p>
        <span style={{ marginRight: "20px" }}>
          {currentDateTime.toLocaleDateString()} {currentDateTime.toLocaleTimeString()}
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

      {/* Right Arrow for Next Day */}
      <button
        onClick={() => handleDayChange("next")}
        style={{
          padding: "5px 10px",
          borderRadius: "50%",
          background: themeType === "dark" ? "#333" : "#ddd",
          color: themeType === "dark" ? "#fff" : "#000",
          border: "none",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        &#8594;
      </button>
    </nav>
  );
};

export default Nav;
