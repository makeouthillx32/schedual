"use client";

import React, { useEffect, useState } from "react";
import SwitchtoDarkMode from "./SwitchtoDarkMode";

interface NavProps {
  themeType: "dark" | "light";
  toggleTheme: () => void;
}

const Nav: React.FC<NavProps> = ({ themeType, toggleTheme }) => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <nav
      className={`flex justify-between items-center p-4 ${
        themeType === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}
    >
      <h1>CMS Schedule App</h1>
      <div>
        <span className="mr-4">{`${currentDateTime.toLocaleDateString()} ${currentDateTime.toLocaleTimeString()}`}</span>
        <SwitchtoDarkMode themeType={themeType} toggleTheme={toggleTheme} />
      </div>
    </nav>
  );
};

export default Nav;
