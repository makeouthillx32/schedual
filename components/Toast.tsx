"use client";

import React from "react";
import { useTheme } from "@/app/provider";

interface ToastProps {
  business_name: string;
  address: string;
  before_open: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ business_name, address, before_open, onClose }) => {
  const { themeType } = useTheme(); // Access the current theme

  return (
    <div
      className="fixed top-5 right-5 p-5 rounded-lg shadow-lg max-w-xs w-full"
      style={{
        backgroundColor: themeType === "dark" ? "#1f2937" : "#ffffff", // Dark gray for dark mode, white for light mode
        color: themeType === "dark" ? "#ffffff" : "#000000", // White text for dark mode, black for light mode
        border: `1px solid ${themeType === "dark" ? "#374151" : "#ccc"}`, // Subtle border based on theme
        zIndex: 1000,
        boxShadow: themeType === "dark" 
          ? "0 4px 6px rgba(255, 255, 255, 0.1)" 
          : "0 4px 6px rgba(0, 0, 0, 0.1)", // Light shadow for depth
      }}
    >
      <button
        onClick={onClose}
        className={`absolute top-2 right-2 w-5 h-5 rounded-full text-center flex items-center justify-center ${
          themeType === "dark" ? "bg-red-500 text-white" : "bg-red-500 text-white"
        }`}
      >
        X
      </button>
      <h4 className="text-lg font-bold">{business_name}</h4>
      <p className="mt-2">
        <strong>Address:</strong>{" "}
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={themeType === "dark" ? "text-blue-400 underline" : "text-blue-500 underline"}
        >
          {address}
        </a>
      </p>
      <p>
        <strong>Before Open:</strong> {before_open ? "Yes" : "No"}
      </p>
    </div>
  );
};

export default Toast;