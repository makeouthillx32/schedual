"use client";

import React from "react";
import { useTheme } from "@/app/provider";

const Footer = () => {
  const { themeType } = useTheme();

  return (
    <footer
      className={`py-4 text-center ${
        themeType === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}
    >
      <p>
        Powered by <span className="font-bold">Unenter</span>
      </p>
      <p>&copy; {new Date().getFullYear()}</p>
    </footer>
  );
};

export default Footer;