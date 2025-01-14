"use client";

import React from "react";
import { useTheme } from "@/app/provider";

const Footer: React.FC = () => {
  const { themeType } = useTheme();

  return (
    <footer
      className={`p-4 text-center ${
        themeType === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}
    >
      <p>Powered by Unenter</p>
    </footer>
  );
};

export default Footer;