"use client";

import React from "react";

interface ToastProps {
  business_name: string;
  address: string;
  before_open: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ business_name, address, before_open, onClose }) => {
  return (
    <div
      className="fixed top-5 right-5 p-5 rounded-lg shadow-lg max-w-xs w-full border"
      style={{
        backgroundColor: "var(--app-card)",
        color: "var(--app-card-foreground)",
        borderColor: "var(--app-border)",
        zIndex: 1000,
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    >
      <button
        onClick={onClose}
        className="absolute top-2 right-2 w-5 h-5 rounded-full text-center flex items-center justify-center bg-red-500 text-white"
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
          className="text-[var(--app-accent)] underline"
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
