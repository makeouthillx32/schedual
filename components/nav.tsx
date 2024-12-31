"use client";

import React, { useEffect, useState } from "react";

interface NavProps {
  themeType: "dark" | "light";
  toggleTheme: () => void;
}

const Nav: React.FC<NavProps> = ({ themeType, toggleTheme }) => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
      <div className="relative">
        <button
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="p-2 bg-gray-200 dark:bg-gray-800 rounded-md"
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${isMenuOpen ? "open" : ""}`}></span>
        </button>
        <div
          className={`absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-md shadow-lg overflow-hidden nav-dropdown ${
            isMenuOpen ? "max-h-screen" : "max-h-0"
          }`}
        >
          <a
            href="#"
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Home
          </a>
          <a
            href="#"
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Schedule
          </a>
          <a
            href="#"
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Settings
          </a>
        </div>
      </div>
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
