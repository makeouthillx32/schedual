"use client";

import React from "react";
import { useTheme } from "@/app/provider";

const Footer: React.FC = () => {
  const { themeType } = useTheme(); // Access themeType from provider

  return (
    <footer
      className="py-4 text-center"
      style={{
        backgroundColor: "var(--background)", // Use dynamic background color
        color: "var(--foreground)", // Use dynamic foreground color
      }}
    >
      <p>
        Powered by <span className="font-bold">Unenter</span>
      </p>
      <p>&copy; {new Date().getFullYear()}</p>
    </footer>
  );
};

export default Footer;