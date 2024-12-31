import React from "react";

interface ToastProps {
  business_name: string;
  address: string;
  before_open: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ business_name, address, before_open, onClose }) => (
  <div
    className="fixed top-5 right-5 p-5 rounded-lg shadow-lg max-w-xs w-full"
    style={{
      backgroundColor: "var(--card)",
      color: "var(--card-foreground)",
      border: "1px solid var(--border)",
      zIndex: 1000,
    }}
  >
    <button
      onClick={onClose}
      className="absolute top-2 right-2 w-5 h-5 rounded-full bg-red-500 text-white text-center flex items-center justify-center"
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
        className="text-blue-500 underline"
      >
        {address}
      </a>
    </p>
    <p>
      <strong>Before Open:</strong> {before_open ? "Yes" : "No"}
    </p>
  </div>
);

export default Toast;
