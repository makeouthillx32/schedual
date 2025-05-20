"use client";

import React from "react";
import { useTheme } from "@/app/provider";
import { X } from "lucide-react";

interface ToastProps {
  business_name: string;
  address: string;
  before_open: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ business_name, address, before_open, onClose }) => {
  const { themeType } = useTheme();
  const isDark = themeType === "dark";
  
  return (
    <div
      className={`fixed top-5 right-5 p-5 rounded-lg max-w-xs w-full border border-[hsl(var(--border))] shadow-[var(--shadow-lg)] z-[1000] ${
        isDark 
          ? "bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]" 
          : "bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]"
      } animate-fade-in`}
    >
      <button
        onClick={onClose}
        className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] hover:bg-[hsl(var(--destructive))]/90 transition-colors"
      >
        <X size={14} />
      </button>
      
      <h4 className="text-lg font-bold mb-2">{business_name}</h4>
      
      <div className="space-y-2">
        <div>
          <span className="font-medium">Address:</span>{" "}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[hsl(var(--sidebar-primary))] hover:underline"
          >
            {address}
          </a>
        </div>
        
        <div className="flex items-center">
          <span className="font-medium mr-2">Cleaning Time:</span>
          <span className={`px-2 py-1 text-xs rounded-full ${
            before_open 
              ? "bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]" 
              : "bg-[hsl(var(--chart-2))]/10 text-[hsl(var(--chart-2))]"
          }`}>
            {before_open ? "Before Opening Hours" : "After Closing Hours"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Toast;