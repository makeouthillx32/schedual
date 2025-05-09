// components/IntroBar.tsx
"use client";

import React from "react";

interface IntroBarProps {
  currentPage: string;
}

const labels: Record<string, string> = {
  about:            "About Us",
  board:            "Board of Directors",
  title9:           "Title 9 Information",
  careers:          "Careers",
  jobs:             "Jobs",
  programs:         "Programs & Services",
  transportation:   "Transportation",
  employment:       "Employment Services",
  "early-childhood": "Early Childhood Services",
  autismdaycamp:    "Autism Day Camp",      // ← single key for your camp page
  artists:          "Artists Guild",
  "supported-living":"Supported Living Services",
  business:         "Business Services",
  commercial:       "Commercial Services",
  pickup:           "Donations & Pick‑Up",
  donate:           "Donate Now",
  involved:         "Get Involved",
  learn:            "Learn & Connect",
  carf:             "CARF Accreditation",
  thriftstore:      "DART Thrift Store",
  shredding:        "Secure Document Shredding",
};

const IntroBar: React.FC<IntroBarProps> = ({ currentPage }) => {
  // never render on the home page
  if (currentPage === "home") return null;

  const label = labels[currentPage as keyof typeof labels];
  if (!label) return null;

  return (
    <div className="bg-blue-500 h-12 md:h-16 flex items-center justify-center">
      <div className="text-white text-xl md:text-2xl font-semibold">
        {label}
      </div>
    </div>
  );
};

export default IntroBar;